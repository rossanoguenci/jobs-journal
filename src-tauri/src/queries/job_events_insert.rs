use super::Database;
use tauri::State;
use crate::models::job_event::JobEvent;
use crate::utils::query_utils::build_insert_query;
use serde_json::json;

#[tauri::command]
pub async fn job_events_insert(db: State<'_, Database>, data: JobEvent) -> Result<String, String> {
    let pool = db.pool.lock().await;
    // Convert to JSON object
    let mut json_data = serde_json::to_value(&data)
        .map_err(|e| e.to_string())?
        .as_object()
        .cloned()
        .ok_or("Failed to parse job event data")?;

    // Add insert_type manually
    json_data.insert("insert_type".to_string(), json!("manual"));


    // Build query (this internally extracts fields and values)
    let mut builder = build_insert_query("job_events", &json_data)?;


    match builder.build().execute(&*pool).await {
        Ok(_) => Ok(format!("JobEntry saved for job_id: {}!", data.job_id)),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
