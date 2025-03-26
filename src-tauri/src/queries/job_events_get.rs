use super::Database;
use serde::Serialize;
use tauri::State;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct JobEvent {
    id: i64,
    job_id: i64,
    date_of_event: String,
    description: String,
    insert_type: String,
    insert_date: String,
}

#[tauri::command]
pub async fn job_events_get(db: State<'_, Database>, job_id: i64) -> Result<Vec<JobEvent>, String> {
    if job_id <= 0 {
        return Ok(vec![]);
    }

    let pool = db.pool.lock().await;

    let events = sqlx::query_as::<_, JobEvent>(
        "SELECT * FROM job_events WHERE job_id=? ORDER BY date_of_event",
    )
    .bind(job_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(events)
}
