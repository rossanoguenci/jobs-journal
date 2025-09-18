#[path = "./job_events_triggers.rs"]
mod job_events_triggers;

use super::Database;
use crate::models::job_insert::JobInsert;
use crate::utils::query_utils::build_insert_query;
use tauri::State;
use crate::utils::id::generate_id;

#[tauri::command]
pub async fn jobs_insert(db: State<'_, Database>, mut data: JobInsert) -> Result<String, String> {
    crate::debug_log!("jobs_insert() - Inserting job with data: {:?}", data);
    
    let pool = db.pool.lock().await;

    // Guard: Insert mode must not include a client-provided id
    if data.id.is_some() {
        return Err("Insert payload must not include an 'id'. Omit 'id' to create a new entry".to_string());
    }

    // Generate the UUID before insertion
    data.id = Some(generate_id());

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
