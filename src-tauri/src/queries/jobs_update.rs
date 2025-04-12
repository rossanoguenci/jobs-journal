#[path = "./job_events_triggers.rs"]
mod job_events_triggers;

use super::Database;
use crate::models::job_update::JobUpdate;
use tauri::State;
use crate::utils::query_utils::build_update_set_clause;


#[tauri::command]
pub async fn jobs_update(db: State<'_, Database>, data: JobUpdate) -> Result<String, String> {
    let pool = db.pool.lock().await;
    let job_id = data.id;

    let serialized = serde_json::to_value(&data).map_err(|e| e.to_string())?;
    let obj = serialized.as_object().ok_or("Failed to parse data")?;

    let (mut query_builder, _) = build_update_set_clause("jobs", obj)?;

    query_builder.push(" WHERE id = ").push_bind(job_id);

    let built_query = query_builder.build();

    match built_query.execute(&*pool).await {
        Ok(_) => {
            // If the update query is successful, check for the 'status' field
            if let Some(status_value) = obj.get("status") {
                // Trigger the job_events_triggers::insert function if status is found
                let status_description = format!("Status changed to {}",status_value);
                job_events_triggers::insert(&pool, job_id, &status_description).await.map_err(|e| e.to_string())?;
            }
            Ok(format!("Updated job entry {} successfully", job_id))
        }
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
