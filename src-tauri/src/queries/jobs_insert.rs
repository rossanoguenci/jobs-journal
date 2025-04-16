#[path = "./job_events_triggers.rs"]
mod job_events_triggers;

use super::Database;
use crate::models::job_insert::JobInsert;
use crate::utils::query_utils::build_insert_query;
use tauri::State;

#[tauri::command]
pub async fn jobs_insert(db: State<'_, Database>, data: JobInsert) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let serialized = serde_json::to_value(&data).map_err(|e| e.to_string())?;
    let obj = serialized.as_object().ok_or("Failed to parse data")?;

    let mut builder = build_insert_query("jobs", obj)?;
    let query = builder.build();

    match query.execute(&*pool).await {
        Ok(result) => {
            let job_id = result.last_insert_rowid();

            if let Err(err) =
                job_events_triggers::insert(&pool, job_id, "Job entry created").await
            {
                eprintln!("Failed to insert job event: {}", err);
            }

            Ok("Entry saved!".to_string())
        }
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
