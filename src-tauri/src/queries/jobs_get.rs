use super::Database;
use tauri::State;
use crate::models::job_entry::JobEntry;
#[tauri::command]
pub async fn jobs_get_list(db: State<'_, Database>) -> Result<Vec<JobEntry>, String> {
    let pool = db.pool.lock().await; // Lock the database pool for safe async access
    let jobs = sqlx::query_as::<_, JobEntry>(
        "SELECT * FROM jobs WHERE insert_status!='archived' ORDER BY application_date DESC, insert_date DESC",
    )
    .fetch_all(&*pool) // Fetch all rows
    .await
    .map_err(|e| e.to_string())?; // Convert SQL errors to String

    Ok(jobs)
}

#[tauri::command]
pub async fn jobs_get_details(db: State<'_, Database>, job_id: i64) -> Result<Option<JobEntry>, String> {
    if job_id <= 0 {
        return Ok(None);
    }
    let pool = db.pool.lock().await;
    let job_detail =
        sqlx::query_as::<_, JobEntry>("SELECT * FROM jobs WHERE id=? AND insert_status!='archived'")
            .bind(job_id)
            .fetch_optional(&*pool)
            .await
            .map_err(|e| e.to_string())?;

    Ok(job_detail)
}
