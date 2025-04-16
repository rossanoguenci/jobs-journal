use super::Database;
use tauri::State;
use crate::models::job_event::JobEvent;

#[tauri::command]
pub async fn job_events_get(db: State<'_, Database>, job_id: i64) -> Result<Vec<JobEvent>, String> {
    if job_id <= 0 {
        return Ok(vec![]);
    }

    let pool = db.pool.lock().await;

    let events = sqlx::query_as::<_, JobEvent>(
        "SELECT * FROM job_events WHERE job_id=? ORDER BY id DESC",
    )
    .bind(job_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(events)
}
