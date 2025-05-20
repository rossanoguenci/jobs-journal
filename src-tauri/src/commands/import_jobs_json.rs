use crate::db::Database;
use tauri::State;
use crate::models::export::JobWithEvents;
use crate::utils::query_utils::build_insert_query;
use serde_json::to_value;

#[tauri::command]
pub async fn import_jobs_json(db: State<'_, Database>, path: String) -> Result<(), String> {
    let json_data = std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let parsed: Vec<JobWithEvents> = serde_json::from_str(&json_data)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    let pool = db.pool.lock().await;

    for JobWithEvents { job, events } in parsed {
        let job_value = to_value(&job).map_err(|e| e.to_string())?;
        let job_obj = job_value
            .as_object()
            .ok_or("Failed to convert job to object")?;
        let mut job_builder = build_insert_query("jobs", job_obj)?;
        job_builder
            .build()
            .execute(&*pool)
            .await
            .map_err(|e| format!("Failed to insert job: {}", e))?;

        for event in events {
            let event_value = to_value(&event).map_err(|e| e.to_string())?;
            let event_obj = event_value
                .as_object()
                .ok_or("Failed to convert event to object")?;
            let mut event_builder = build_insert_query("job_events", event_obj)?;
            event_builder
                .build()
                .execute(&*pool)
                .await
                .map_err(|e| format!("Failed to insert event: {}", e))?;
        }
    }

    Ok(())
}
