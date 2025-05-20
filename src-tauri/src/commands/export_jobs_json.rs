use tauri::State;
use crate::db::Database;
use crate::models::export::JobWithEvents;
use crate::queries::jobs_export::fetch_all_jobs_with_events;
use std::fs;

#[tauri::command]
pub async fn export_jobs_json(db: State<'_, Database>, path: String) -> Result<(), String> {
    let jobs_with_events: Vec<JobWithEvents> = fetch_all_jobs_with_events(db).await?;

    let json = serde_json::to_string_pretty(&jobs_with_events)
        .map_err(|e| format!("Serialization error: {}", e))?;

    fs::write(&path, json)
        .map_err(|e| format!("File write error: {}", e))?;

    Ok(())
}
