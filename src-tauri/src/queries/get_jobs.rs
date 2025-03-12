use super::Database;
use serde::Serialize;
use sqlx::{Error, SqlitePool};
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Job {
    id: i32,
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

    let jobs = sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE insert_status!='trashed' ORDER BY id DESC")
        .fetch_all(&*pool) // Fetch all rows
        .await
        .map_err(|e| e.to_string())?; // Convert SQL errors to String

    Ok(jobs)
}
