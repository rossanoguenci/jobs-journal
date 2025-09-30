//! Orphan job entries reconciliation commands.
//!
//! This module provides a two-phase flow:
//! - ensure_orphans_preview: fast, read-only detection of orphan jobs (jobs whose meta.period_id is
//!   missing/empty or not among the stored period ids).
//! - ensure_orphans_apply_infer_by_date: efficient bulk assignment of orphans by inferring target
//!   period from application_date ranges, with a deterministic fallback (existing period, selected
//!   period, or creating a new period via the existing periods API).
//!
//! Notes:
//! - Uses existing periods API (get_periods / upsert_period). Does not touch period option keys
//!   directly to avoid duplication and drift.
//! - Scans all jobs (no archived filter by design; adjust if needed later).
//! - Designed for large volumes: counts and bulk UPDATEs with SQLite JSON1 functions.

use crate::db::Database;
use crate::models::job_period::PeriodsResponse;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnsureOrphansPreview {
    pub orphan_count: i64,
    pub total_jobs: i64,
    pub period_ids: Vec<String>,
    pub suggested_period_id: Option<String>,
    pub message: String,
}

#[tauri::command]
pub async fn ensure_orphans_preview(db: State<'_, Database>) -> Result<EnsureOrphansPreview, String> {
    crate::info_log!("ensure_orphans_preview()");

    // Use the existing periods API
    let periods_resp: PeriodsResponse = crate::commands::periods::get_periods(db.clone()).await?;
    let valid_ids: Vec<String> = periods_resp.periods.iter().map(|p| p.id.clone()).collect();

    crate::debug_log!("ensure_orphans_preview() periods_resp -> {:?}", periods_resp);
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

    crate::debug_log!("ensure_orphans_preview() orphan_count ->  {:?}", orphan_count);

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

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum OrphansFallbackTarget {
    ExistingPeriod { period_id: String },
    UseSelected,
    CreateNewPeriod { start: String, #[serde(default)] end: Option<String> },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnsureOrphansApplyOutcome {
    pub updated_by_infer: i64,
    pub updated_by_fallback: i64,
    pub total_updated: i64,
    pub message: String,
}

#[tauri::command]
pub async fn ensure_orphans_apply_infer_by_date(
    db: State<'_, Database>,
    fallback: OrphansFallbackTarget,
) -> Result<EnsureOrphansApplyOutcome, String> {
    crate::info_log!("ensure_orphans_apply_infer_by_date()");

    // 1) Read periods via API
    let mut periods_resp: PeriodsResponse = crate::commands::periods::get_periods(db.clone()).await?;

    // 2) Resolve fallback target
    let fallback_period_id: String = match fallback {
        OrphansFallbackTarget::ExistingPeriod { period_id } => period_id,
        OrphansFallbackTarget::UseSelected => {
            if periods_resp.selected.is_empty() {
                return Err("No selected period available".into());
            }
            periods_resp.selected.clone()
        }
        OrphansFallbackTarget::CreateNewPeriod { start, end } => {
            // Create using existing API; it will select the newly created period
            let mut obj = json!({ "start": start });
            if let Some(e) = end { obj["end"] = json!(e); }
            crate::commands::periods::upsert_period(db.clone(), obj).await?;

            // Reload periods to get the selected id
            periods_resp = crate::commands::periods::get_periods(db.clone()).await?;
            if periods_resp.selected.is_empty() {
                return Err("Newly created period not selected as expected".into());
            }
            periods_resp.selected.clone()
        }
    };

    // 3) Valid ids used for orphan detection
    let valid_ids: Vec<String> = periods_resp
        .periods
        .iter()
        .map(|p| p.id.clone())
        .collect();


    let pool = db.pool.lock().await;

    // 4) Infer by date: for each period, assign orphans whose application_date falls within [start, end]
    let mut updated_by_infer: u64 = 0;
    for p in &periods_resp.periods {
        let pid = p.id.as_str();
        let start = p.start.as_str();
        let end_opt = p.end.as_deref();

        let mut qb = sqlx::QueryBuilder::new(
            "UPDATE jobs SET meta = json_set(meta, '$.period_id', ",
        );
        qb.push_bind(pid);
        qb.push(") WHERE ");
        push_orphan_predicate(&mut qb, &valid_ids);
        qb.push(" AND application_date >= ");
        qb.push_bind(start);
        if let Some(end) = end_opt {
            qb.push(" AND application_date <= ");
            qb.push_bind(end);
        }
        let res = qb.build().execute(&*pool).await.map_err(|e| e.to_string())?;
        updated_by_infer += res.rows_affected();
    }

    // 5) Fallback: any remaining orphans get assigned to fallback_period_id
    let mut qb = sqlx::QueryBuilder::new(
        "UPDATE jobs SET meta = json_set(meta, '$.period_id', ",
    );
    qb.push_bind(&fallback_period_id);
    qb.push(") WHERE ");
    push_orphan_predicate(&mut qb, &valid_ids);
    let res = qb.build().execute(&*pool).await.map_err(|e| e.to_string())?;
    let updated_by_fallback = res.rows_affected() as i64;

    let total_updated = (updated_by_infer as i64) + updated_by_fallback;
    Ok(EnsureOrphansApplyOutcome {
        updated_by_infer: updated_by_infer as i64,
        updated_by_fallback,
        total_updated,
        message: format!(
            "Assigned {} by date inference and {} by fallback (total {})",
            updated_by_infer, updated_by_fallback, total_updated
        ),
    })
}

// Startup flag management for preview step
#[tauri::command]
pub async fn get_orphans_check_flag(db: State<'_, Database>) -> Result<bool, String> {
    match crate::commands::options::get_option(db, ORPHANS_FLAG_KEY).await? {
        Some(serde_json::Value::Bool(b)) => Ok(b),
        _ => Ok(false),
    }
}

#[tauri::command]
pub async fn set_orphans_check_flag(db: State<'_, Database>, value: bool) -> Result<(), String> {
    crate::commands::options::set_option(
        db,
        ORPHANS_FLAG_KEY,
        serde_json::Value::Bool(value),
    )
    .await
}