use crate::commands::periods::ensure_periods;
use crate::db::Database;
use serde::Serialize;
use tauri::State;
use ts_rs::TS;

#[derive(Debug, Serialize, Clone, TS)]
#[ts(export)]
pub struct StepResult {
    pub key: String,
    pub changed: bool,
    pub message: String,
}

#[derive(Debug, Serialize, Clone, TS)]
#[ts(export)]
pub struct RunResult {
    pub steps: Vec<StepResult>,
}


async fn run_registry(db: State<'_, Database>) -> Result<Vec<StepResult>, String> {
    let mut steps = Vec::new();

    // Ensure periods and a valid selection (handled inside ensure_periods)
    ensure_periods(db.clone()).await?;
    steps.push(StepResult {
        key: "ensure_periods".into(),
        changed: false, // unknown here; treat as informational
        message: "Periods and selection ensured".into(),
    });

    Ok(steps)
}

#[tauri::command]
pub async fn startup_run_checks(db: State<'_, Database>) -> Result<RunResult, String> {
    let steps = run_registry(db).await?;
    Ok(RunResult { steps })
}
