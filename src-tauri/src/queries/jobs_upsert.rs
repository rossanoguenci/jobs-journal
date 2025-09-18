#[path = "./job_events_triggers.rs"]
mod job_events_triggers;

use super::Database;
use crate::models::job_upsert::JobUpsertPayload;
use crate::utils::id::generate_id;
use crate::utils::query_utils::{build_insert_query, build_update_set_clause};
use tauri::State;

#[tauri::command]
pub async fn jobs_upsert(
    db: State<'_, Database>,
    data: JobUpsertPayload,
) -> Result<String, String> {
    crate::debug_log!("jobs_upsert() - Upserting job with data: {:?}", data);

    let pool = db.pool.lock().await;

    match data {
        JobUpsertPayload::Update(job_update) => {
            crate::info_log!("This is an UPDATE");

            let job_id = job_update.id.clone();
            let serialized = serde_json::to_value(&job_update).map_err(|e| e.to_string())?;
            let obj = serialized.as_object().ok_or("Failed to parse data")?;

            let (mut query_builder, _) = build_update_set_clause("jobs", obj)?;
            query_builder.push(" WHERE id = ").push_bind(&job_id);
            let built_query = query_builder.build();

            match built_query.execute(&*pool).await {
                Ok(_) => {
                    if let Some(status_value) = obj.get("status") {
                        if !status_value.is_null()
                            && !status_value.as_str().unwrap_or("").is_empty()
                        {
                            let status_description = format!("Status changed to {}", status_value);
                            job_events_triggers::insert(&pool, &job_id, &status_description)
                                .await
                                .map_err(|e| e.to_string())?;
                        }
                    }
                    crate::info_log!("Updated job entry {}", job_id);
                    Ok(format!("Updated job entry {} successfully", job_id))
                }
                Err(e) => Err(format!("Database error: {}", e)),
            }
        }
        JobUpsertPayload::Insert(mut job_insert) => {
            crate::info_log!("This is an INSERT");
            // Guard: Insert mode must not include a client-provided id
            if job_insert.id.is_some() {
                crate::error_log!(
                    "The obj has already an id: {:?}",
                    job_insert.id.clone().unwrap()
                );
                return Err(
                    "Insert payload must not include an 'id'. Omit 'id' to create a new entry"
                        .to_string(),
                );
            }

            // Generate a new id
            job_insert.id = Some(generate_id());

            let serialized = serde_json::to_value(&job_insert).map_err(|e| e.to_string())?;
            let obj = serialized.as_object().ok_or("Failed to parse data")?;

            let mut builder = build_insert_query("jobs", obj)?;
            let query = builder.build();

            match query.execute(&*pool).await {
                Ok(_) => {
                    if let Some(job_id) = &job_insert.id {
                        if let Err(err) =
                            job_events_triggers::insert(&pool, job_id, "Job entry created").await
                        {
                            crate::error_log!("Failed to insert job event: {}", err);
                            eprintln!("Failed to insert job event: {}", err);
                        }
                    }
                    Ok("Entry saved!".to_string())
                }
                Err(e) => Err(format!("Database error: {}", e)),
            }
        }
    }
}
