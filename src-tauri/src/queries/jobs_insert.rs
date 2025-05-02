#[path = "./job_events_triggers.rs"]
mod job_events_triggers;

use super::Database;
use crate::models::job_insert::JobInsert;
use crate::utils::query_utils::build_insert_query;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn jobs_insert(db: State<'_, Database>, mut data: JobInsert) -> Result<String, String> {
    let pool = db.pool.lock().await;

    // Generate the UUID before insertion
    if data.id.is_none() {
        data.id = Some(Uuid::new_v4().to_string());
    }

    // Convert data to a JSON object
    let serialized = serde_json::to_value(&data).map_err(|e| e.to_string())?;
    let obj = serialized.as_object().ok_or("Failed to parse data")?;

    // Build the SQL insert query
    let mut builder = build_insert_query("jobs", obj)?;
    let query = builder.build();

    match query.execute(&*pool).await {
        Ok(_) => {
            // Insert related event
            if let Some(job_id) = &data.id {
                if let Err(err) = job_events_triggers::insert(&pool, job_id, "Job entry created").await
                {
                    eprintln!("Failed to insert job event: {}", err);
                }
            } else {
                eprintln!("Job ID is missing, event not recorded.");
            }

            Ok("Entry saved!".to_string())
        }
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
