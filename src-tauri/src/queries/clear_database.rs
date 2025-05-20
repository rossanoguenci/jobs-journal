use crate::db::Database;
use tauri::State;

#[tauri::command]
pub async fn clear_database(db: State<'_, Database>) -> Result<(), String> {
    let pool = db.pool.lock().await;

    // Clear child table first to respect foreign key relationships
    sqlx::query("DELETE FROM job_events")
        .execute(&*pool)
        .await
        .map_err(|e| format!("Failed to delete job events: {}", e))?;

    sqlx::query("DELETE FROM jobs")
        .execute(&*pool)
        .await
        .map_err(|e| format!("Failed to delete jobs: {}", e))?;

    Ok(())
}
