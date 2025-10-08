//! Orphan job entries reconciliation commands.
//!
//! This module provides a two-phase flow:
//! - ensure_orphans_preview: fast, read-only detection of orphan jobs (jobs whose meta.period_id is missing/empty or not among the stored period ids).
//! - ensure_orphans_apply_infer_by_date: efficient bulk assignment of orphans by inferring a target period from application_date ranges, with a deterministic fallback (existing period, selected period, or creating a new period via the existing periods API).
//!
//! Notes:
//! - Uses the existing periods API (get_periods / upsert_period). It does not touch period option keys directly to avoid duplication and drift.
//! - Scans all jobs (no archived filter by design; adjust if needed later).
//! - Designed for large volumes: counts and bulk UPDATEs with SQLite JSON1 functions.

use crate::db::Database;
use crate::models::job_period::PeriodsResponse;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

/// Option key used to store whether the “check orphans at startup” step is enabled.
///
/// This key is persisted via the generic options API and can be read and written
/// through the `get_orphans_check_flag` and `set_orphans_check_flag` commands.
pub const ORPHANS_FLAG_KEY: &str = "orphans_check_at_startup";

/// Build the orphan predicate directly into the QueryBuilder.
///
/// Orphan = meta.period_id is NULL or '' or NOT IN valid_ids (when valid_ids is non-empty).
fn push_orphan_predicate<'a>(
    qb: &mut sqlx::QueryBuilder<'a, sqlx::Sqlite>,
    valid_ids: &'a [String],
) {
    qb.push("(json_extract(meta, '$.period_id') IS NULL OR json_extract(meta, '$.period_id') = ''");
    if !valid_ids.is_empty() {
        qb.push(" OR json_extract(meta, '$.period_id') NOT IN (");
        let mut sep = qb.separated(", ");
        for id in valid_ids {
            sep.push_bind(id);
        }
        qb.push(")");
    }
    qb.push(")");
}

/// Summary information returned by `ensure_orphans_preview`.
///
/// This is a fast, read-only snapshot used by the UI to decide whether a blocking resolver must be shown to the user at start-up.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnsureOrphansPreview {
    /// Number of jobs currently considered orphans.
    pub orphan_count: i64,
    /// Total number of jobs in the database (for context only).
    pub total_jobs: i64,
    /// List of valid period ids known to the system at the time of the check.
    pub period_ids: Vec<String>,
    /// Convenience hint: currently selected period id (if any).
    pub suggested_period_id: Option<String>,
    /// Human‑friendly message summarising the situation.
    pub message: String,
}

/// Extended preview returned by `ensure_orphans_preview_split`.
///
/// In addition to the basic numbers, it estimates how many orphans would be automatically assigned by date inference and how many would still require a fallback choice from the user.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnsureOrphansPreviewSplit {
    /// Number of jobs currently considered orphans.
    pub orphan_count: i64,
    /// Total number of jobs in the database.
    pub total_jobs: i64,
    /// Orphans that could be auto-assigned because their application_date falls
    /// within at least one period range (inclusive; open-ended end supported).
    pub would_infer_count: i64,
    /// Orphans that would not be covered by any period and thus need a fallback.
    pub would_need_fallback_count: i64,
    /// List of valid period ids known to the system at the time of the check.
    pub period_ids: Vec<String>,
    /// Convenience hint: currently selected period id (if any).
    pub suggested_period_id: Option<String>,
    /// Human‑friendly message summarising the split.
    pub message: String,
}

/// Compute a read-only snapshot of orphan jobs.
///
/// Orphans are jobs whose `meta.period_id` is missing/empty or does not belong to the current set of saved periods; this call performs only `SELECT COUNT(*)` queries and returns context information used by the UI.
///
/// Returns an [`EnsureOrphansPreview`] with counts and a suggested period id.
#[tauri::command]
pub async fn ensure_orphans_preview(
    db: State<'_, Database>,
) -> Result<EnsureOrphansPreview, String> {
    crate::info_log!("ensure_orphans_preview()");

    // Use the existing periods API
    let periods_resp: PeriodsResponse = crate::commands::periods::get_periods(db.clone()).await?;
    let valid_ids: Vec<String> = periods_resp.periods.iter().map(|p| p.id.clone()).collect();

    crate::debug_log!(
        "ensure_orphans_preview() periods_resp -> {:?}",
        periods_resp
    );
    crate::debug_log!("ensure_orphans_preview() valid_ids -> {:?}", valid_ids);

    let pool = db.pool.lock().await;

    // Count all jobs (no filtering)
    let total_jobs: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM jobs")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    crate::debug_log!("ensure_orphans_preview() total_jobs -> {:?}", total_jobs);

    // Count orphans using predicate builder
    let mut qb = sqlx::QueryBuilder::new("SELECT COUNT(*) FROM jobs WHERE ");
    push_orphan_predicate(&mut qb, &valid_ids);
    let orphan_count: (i64,) = qb
        .build_query_as()
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    crate::debug_log!(
        "ensure_orphans_preview() orphan_count ->  {:?}",
        orphan_count
    );

    let result = EnsureOrphansPreview {
        orphan_count: orphan_count.0,
        total_jobs: total_jobs.0,
        period_ids: valid_ids,
        suggested_period_id: if periods_resp.selected.is_empty() {
            None
        } else {
            Some(periods_resp.selected)
        },
        message: if orphan_count.0 > 0 {
            format!(
                "Found {} orphan job(s) out of {}",
                orphan_count.0, total_jobs.0
            )
        } else {
            format!("No orphan jobs ({} total)", total_jobs.0)
        },
    };
    crate::info_log!("ensure_orphans_preview() result -> {:?}", result);
    Ok(result)
}

/// Compute an extended, non-mutating preview of orphans with a split.
///
/// In addition to the overall orphan count, this returns two estimates:
/// - `would_infer_count`: orphans that fit at least one period by date and would be auto-assigned during the applied step.
/// - `would_need_fallback_count`: orphans that don't fit any period and would be assigned using the chosen fallback period.
#[tauri::command]
pub async fn ensure_orphans_preview_split(
    db: State<'_, Database>,
) -> Result<EnsureOrphansPreviewSplit, String> {
    crate::info_log!("ensure_orphans_preview_split()");

    // Use the existing periods API
    let periods_resp: PeriodsResponse = crate::commands::periods::get_periods(db.clone()).await?;
    let valid_ids: Vec<String> = periods_resp.periods.iter().map(|p| p.id.clone()).collect();

    let pool = db.pool.lock().await;

    // Count all jobs (no filtering)
    let total_jobs: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM jobs")
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    // Count orphans using predicate builder
    let mut qb_orphans = sqlx::QueryBuilder::new("SELECT COUNT(*) FROM jobs WHERE ");
    push_orphan_predicate(&mut qb_orphans, &valid_ids);
    let orphan_count: (i64,) = qb_orphans
        .build_query_as()
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    // would_infer_count = orphan AND application_date falls within ANY saved period range
    // Periods are stored in options, not in a SQL table, so we must build a dynamic OR of ranges.
    let would_infer_count: (i64,) = if periods_resp.periods.is_empty() {
        (0,)
    } else {
        let mut qb_infer = sqlx::QueryBuilder::new("SELECT COUNT(DISTINCT id) FROM jobs WHERE ");
        push_orphan_predicate(&mut qb_infer, &valid_ids);
        qb_infer.push(" AND (");

        let mut first = true;
        for p in &periods_resp.periods {
            let start = p.start.as_str();
            let end_opt = match p.end.as_deref() {
                Some(s) if s.trim().is_empty() => None,
                other => other,
            };

            if !first { qb_infer.push(" OR "); }
            first = false;

            qb_infer.push("(");
            qb_infer.push(" application_date >= ");
            qb_infer.push_bind(start);
            if let Some(end) = end_opt {
                qb_infer.push(" AND application_date <= ");
                qb_infer.push_bind(end);
            }
            qb_infer.push(")");
        }

        qb_infer.push(")");
        qb_infer
            .build_query_as()
            .fetch_one(&*pool)
            .await
            .map_err(|e| e.to_string())?
    };

    let would_need_fallback_count = orphan_count.0 - would_infer_count.0;

    let result = EnsureOrphansPreviewSplit {
        orphan_count: orphan_count.0,
        total_jobs: total_jobs.0,
        would_infer_count: would_infer_count.0,
        would_need_fallback_count,
        period_ids: valid_ids,
        suggested_period_id: if periods_resp.selected.is_empty() {
            None
        } else {
            Some(periods_resp.selected)
        },
        message: if orphan_count.0 > 0 {
            format!(
                "Found {} orphan job(s) out of {} — {} would be auto-assigned by date, {} would need fallback",
                orphan_count.0, total_jobs.0, would_infer_count.0, would_need_fallback_count
            )
        } else {
            format!("No orphan jobs ({} total)", total_jobs.0)
        },
    };

    crate::info_log!("ensure_orphans_preview_split() result -> {:?}", result);
    Ok(result)
}

/// Fallback target to use for orphans that cannot be inferred by date.
///
/// This is provided by the UI when applying the resolution.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum OrphansFallbackTarget {
    /// Assign remaining orphans to an already existing period.
    ExistingPeriod {
        /// The id of the target period.
        period_id: String,
    },
    /// Create a new period and assign remaining orphans to it.
    ///
    /// When `end` is `None` or an empty string on the UI side, the period is treated as open‑ended.
    CreateNewPeriod {
        /// Period start date in YYYY-MM-DD format.
        start: String,
        /// Optional period end date in YYYY-MM-DD format.
        #[serde(default)]
        end: Option<String>,
    },
}

/// Outcome summary returned by `ensure_orphans_apply_infer_by_date`.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnsureOrphansApplyOutcome {
    /// Rows updated during the inference phase (date-based assignment).
    pub updated_by_infer: i64,
    /// Rows updated during the fallback phase.
    pub updated_by_fallback: i64,
    /// Convenience total = `updated_by_infer + updated_by_fallback`.
    pub total_updated: i64,
    /// Human‑friendly message summarising the operation.
    pub message: String,
}

/// Resolve orphan jobs by first attempting date-based inference, then applying a fallback.
///
/// Phase 1 (inference): for each existing period, update orphan jobs whose `application_date` is within the period range `[start, end]`; empty or whitespace-only `end` values are treated as open‑ended.
///
/// Phase 2 (fallback): any remaining orphans are bulk-assigned to the target specified by [`OrphansFallbackTarget`]; if `CreateNewPeriod` is supplied, the period is created via the existing periods API and the newly selected id is used as the fallback target.
///
/// Returns an [`EnsureOrphansApplyOutcome`] summarising the number of updated rows for both phases.
#[tauri::command]
pub async fn ensure_orphans_apply_infer_by_date(
    db: State<'_, Database>,
    fallback: OrphansFallbackTarget,
) -> Result<EnsureOrphansApplyOutcome, String> {
    crate::info_log!("ensure_orphans_apply_infer_by_date()");
    crate::debug_log!(
        "ensure_orphans_apply_infer_by_date() input fallback -> {:?}",
        fallback
    );

    // 1) Read periods via API
    let mut periods_resp: PeriodsResponse =
        crate::commands::periods::get_periods(db.clone()).await?;
    crate::debug_log!(
        "ensure_orphans_apply_infer_by_date() initial periods_resp -> {:?}",
        periods_resp
    );

    // 2) Resolve fallback target
    let fallback_period_id: String = match fallback {
        OrphansFallbackTarget::ExistingPeriod { period_id } => period_id,
        OrphansFallbackTarget::CreateNewPeriod { start, end } => {
            // Create using existing API; it will select the newly created period
            let mut obj = json!({ "start": start });
            if let Some(e) = end {
                obj["end"] = json!(e);
            }
            crate::commands::periods::upsert_period(db.clone(), obj).await?;

            // Reload periods to get the selected id
            periods_resp = crate::commands::periods::get_periods(db.clone()).await?;
            if periods_resp.selected.is_empty() {
                return Err("Newly created period not selected as expected".into());
            }
            periods_resp.selected.clone()
        }
    };
    crate::info_log!(
        "ensure_orphans_apply_infer_by_date() resolved fallback_period_id -> {}",
        fallback_period_id
    );

    // 3) Valid ids used for orphan detection
    let valid_ids: Vec<String> = periods_resp.periods.iter().map(|p| p.id.clone()).collect();
    crate::debug_log!(
        "ensure_orphans_apply_infer_by_date() valid_ids ({}): {:?}",
        valid_ids.len(),
        valid_ids
    );

    let pool = db.pool.lock().await;

    // 4) Infer by date: for each period, assign orphans whose application_date falls within [start, end]
    let mut updated_by_infer: u64 = 0;
    crate::info_log!(
        "ensure_orphans_apply_infer_by_date() starting inference across {} period(s)",
        periods_resp.periods.len()
    );
    for p in &periods_resp.periods {
        let pid = p.id.as_str();
        let start = p.start.as_str();
        // Normalise: treat empty-string ends as None (open-ended period)
        let end_opt = match p.end.as_deref() {
            Some(s) if s.trim().is_empty() => None,
            other => other,
        };
        crate::info_log!(
            "ensure_orphans_apply_infer_by_date() inferring for period id={} start={} end={:?}",
            pid,
            start,
            end_opt
        );

        let mut qb =
            sqlx::QueryBuilder::new("UPDATE jobs SET meta = json_set(meta, '$.period_id', ");
        qb.push_bind(pid);
        qb.push(") WHERE ");
        push_orphan_predicate(&mut qb, &valid_ids);
        qb.push(" AND application_date >= ");
        qb.push_bind(start);
        if let Some(end) = end_opt {
            qb.push(" AND application_date <= ");
            qb.push_bind(end);
        }
        let res = qb
            .build()
            .execute(&*pool)
            .await
            .map_err(|e| e.to_string())?;
        let affected = res.rows_affected();
        updated_by_infer += affected;
        crate::info_log!(
            "ensure_orphans_apply_infer_by_date() period {} updated_by_infer step affected rows -> {}",
            pid,
            affected
        );
    }
    crate::info_log!(
        "ensure_orphans_apply_infer_by_date() total updated_by_infer -> {}",
        updated_by_infer
    );

    // 5) Fallback: any remaining orphans get assigned to fallback_period_id
    let mut qb = sqlx::QueryBuilder::new("UPDATE jobs SET meta = json_set(meta, '$.period_id', ");
    qb.push_bind(&fallback_period_id);
    qb.push(") WHERE ");
    push_orphan_predicate(&mut qb, &valid_ids);
    crate::info_log!(
        "ensure_orphans_apply_infer_by_date() executing fallback assignment to period_id={}",
        fallback_period_id
    );
    let res = qb
        .build()
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    let updated_by_fallback = res.rows_affected() as i64;
    crate::info_log!(
        "ensure_orphans_apply_infer_by_date() updated_by_fallback -> {}",
        updated_by_fallback
    );

    let total_updated = (updated_by_infer as i64) + updated_by_fallback;
    let outcome = EnsureOrphansApplyOutcome {
        updated_by_infer: updated_by_infer as i64,
        updated_by_fallback,
        total_updated,
        message: format!(
            "Assigned {} by date inference and {} by fallback (total {})",
            updated_by_infer, updated_by_fallback, total_updated
        ),
    };
    crate::info_log!(
        "ensure_orphans_apply_infer_by_date() outcome -> {:?}",
        outcome
    );
    Ok(outcome)
}

// Startup flag management for preview step
/// Read the persisted "check orphans at start-up" flag.
///
/// Returns `true` if the flag is set, otherwise `false` when absent or not a boolean.
#[tauri::command]
pub async fn get_orphans_check_flag(db: State<'_, Database>) -> Result<bool, String> {
    match crate::commands::options::get_option(db, ORPHANS_FLAG_KEY).await? {
        Some(serde_json::Value::Bool(b)) => Ok(b),
        _ => Ok(false),
    }
}

/// Persist the "check orphans at startup" flag.
///
/// Passing `true` enables the blocking orphan check step; `false` disables it.
#[tauri::command]
pub async fn set_orphans_check_flag(db: State<'_, Database>, value: bool) -> Result<(), String> {
    crate::commands::options::set_option(db, ORPHANS_FLAG_KEY, serde_json::Value::Bool(value)).await
}
