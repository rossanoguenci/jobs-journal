//! Startup checks command and registry.
//!
//! This module exposes a Tauri command that runs a set of idempotent
//! startup checks/migrations against the app's database. Each check
//! returns a rich internal outcome which is then mapped into a
//! `StepResult` to indicate what was done and whether anything changed.
//! The aggregated results are returned as a `RunResult` and can be
//! displayed by the frontend.

use crate::db::Database;
use tauri::State;
use crate::models::startup_results::{StepResult,RunResult};
use crate::commands::orphans::ORPHANS_FLAG_KEY;

/// Run all registered startup steps and collect their results.
///
/// This function is kept private to the module and is invoked by
/// the public Tauri command. It is designed to be idempotent: re-running
/// it should not cause unintended side effects.
async fn run_registry(db: State<'_, Database>) -> Result<Vec<StepResult>, String> {
    let mut steps = Vec::new();

    // Ensure periods and a valid selection in the database.
    let outcome = crate::commands::periods::ensure_periods_step(db.clone()).await?;
    steps.push(StepResult {
        key: "ensure_periods".into(),
        changed: outcome.changed,
        message: outcome.message,
        requires_action: false,
    });

    // Optionally run a lightweight orphans preview if the flag is enabled
    let check_flag = match crate::commands::options::get_option(db.clone(), ORPHANS_FLAG_KEY).await? {
        Some(serde_json::Value::Bool(b)) => b,
        _ => false,
    };

    if check_flag {
        let preview = crate::commands::orphans::ensure_orphans_preview(db.clone()).await?;
        let needs_action = preview.orphan_count > 0;
        let msg = if needs_action {
            format!("{} — open Orphans dialog to resolve.", preview.message)
        } else {
            preview.message
        };
        steps.push(StepResult {
            key: "ensure_orphans_preview".into(),
            changed: false, // preview doesn't mutate data
            message: msg,
            requires_action: needs_action,
        });
    }

    Ok(steps)
}

/// Run the startup checks and return their aggregated results.
///
/// This function is exposed to the Tauri runtime as a command and can be
/// invoked from the frontend. It returns a RunResult that the UI can
/// render for diagnostics or onboarding flows.
#[tauri::command]
pub async fn startup_run_checks(db: State<'_, Database>) -> Result<RunResult, String> {
    let steps = run_registry(db).await?;
    Ok(RunResult { steps })
}
