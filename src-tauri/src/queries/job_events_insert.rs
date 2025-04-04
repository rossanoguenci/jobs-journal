use super::Database;
use tauri::State;
use crate::models::job_event::JobEvent;

#[tauri::command]
pub async fn job_events_insert(db: State<'_, Database>, data: JobEvent) -> Result<String, String> {
    let pool = db.pool.lock().await;
    let job_id: i64 = data.job_id;

    let date_of_event = data.date_of_event;

    let query_str = if !date_of_event.is_empty() {
        "INSERT INTO job_events (job_id, description, insert_type, date_of_event) VALUES (?, ?, ?, ?)"
    } else {
        "INSERT INTO job_events (job_id, description, insert_type) VALUES (?, ?, ?)"
    };

    let mut query = sqlx::query(query_str)
        .bind(job_id)
        .bind(data.description)
        .bind("manual");

    if !date_of_event.is_empty() {
        query = query.bind(date_of_event);
    }

    match query.execute(&*pool).await {
        Ok(_) => Ok(format!("JobEntry saved for job_id: {}!", data.job_id)),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
