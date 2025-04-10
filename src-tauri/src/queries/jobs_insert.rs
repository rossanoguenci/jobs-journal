#[path = "./job_events_insert_trigger.rs"]
mod job_events_insert_trigger;

use super::Database;
use crate::models::job_insert::JobInsert;
use tauri::State;

#[tauri::command]
pub async fn jobs_insert(db: State<'_, Database>, data: JobInsert) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let application_date = data.application_date;

    let query_str = if application_date.is_some() {
        "INSERT INTO jobs (company, title, link, application_date) VALUES (?, ?, ?, ?)"
    } else {
        "INSERT INTO jobs (company, title, link) VALUES (?, ?, ?)"
    };

    let mut query = sqlx::query(query_str)
        .bind(data.company)
        .bind(data.title)
        .bind(data.link);

    if application_date.is_some() {
        query = query.bind(application_date);
    }

    match query.execute(&*pool).await {
        Ok(result) => {
            let job_id = result.last_insert_rowid(); // Get the inserted job's ID

            // Call `job_events_insert_trigger`
            if let Err(err) =
                job_events_insert_trigger::job_events_insert_trigger(&pool, job_id).await
            {
                eprintln!("Failed to insert job event: {}", err);
            }

            Ok("Entry saved!".to_string())
        }
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
