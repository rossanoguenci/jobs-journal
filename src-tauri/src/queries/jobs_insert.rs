#[path = "./job_events_insert_trigger.rs"]
mod job_events_insert_trigger;

use tauri::State;
use super::Database;

#[derive(serde::Deserialize, Debug)]
pub struct JobEntry {
    pub company: String,
    pub title: String,
    pub link: Option<String>,
    pub date: Option<String>,
}

#[tauri::command]
pub async fn insert_job_entry(db: State<'_, Database>, data: JobEntry) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let application_date =  data.date.as_deref().unwrap_or("");

    let query_str = if !application_date.is_empty() {
        "INSERT INTO jobs (company, title, link, application_date) VALUES (?, ?, ?, ?)"
    } else {
        "INSERT INTO jobs (company, title, link) VALUES (?, ?, ?)"
    };

    let mut query = sqlx::query(query_str)
        .bind(data.company)
        .bind(data.title)
        .bind(data.link);

    if !application_date.is_empty() {
        query = query.bind(application_date);
    }

    match query.execute(&*pool).await {
        Ok(result) => {
            let job_id = result.last_insert_rowid(); // Get the inserted job's ID

            // Call `job_events_insert_trigger`
            if let Err(err) = job_events_insert_trigger::job_events_insert_trigger(&pool, job_id).await {
                eprintln!("Failed to insert job event: {}", err);
            }

            Ok("Entry saved!".to_string())
        }
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
