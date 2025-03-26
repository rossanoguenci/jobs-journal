use super::Database;
use serde::Serialize;
use tauri::State;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Job {
    id: i64,
    insert_date: String,
    company: String,
    title: String,
    link: String,
    application_date: String,
    status: String,
}

#[tauri::command]
pub async fn get_jobs(db: State<'_, Database>) -> Result<Vec<Job>, String> {
    let pool = db.pool.lock().await; // Lock the database pool for safe async access

    let jobs = sqlx::query_as::<_, Job>(
        "SELECT * FROM jobs WHERE insert_status!='trashed' ORDER BY id DESC",
    )
    .fetch_all(&*pool) // Fetch all rows
    .await
    .map_err(|e| e.to_string())?; // Convert SQL errors to String

    Ok(jobs)
}

#[tauri::command]
pub async fn jobs_get_details(db: State<'_, Database>, job_id: i64) -> Result<Option<Job>, String> {
    if job_id <= 0 {
        return Ok(None);
    }
    let pool = db.pool.lock().await;

    let job_detail =
        sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE id=? AND insert_status!='trashed'")
            .bind(job_id)
            .fetch_optional(&*pool)
            .await
            .map_err(|e| e.to_string())?;

    Ok(job_detail)
}
