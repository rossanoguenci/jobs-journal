use super::Database;
use tauri::State;

#[tauri::command]
pub async fn trash_job_entry(db: State<'_, Database>, id: i32) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let query_str = "UPDATE jobs SET insert_status = 'trashed' WHERE id = ?";

    let result = sqlx::query(query_str).bind(id).execute(&*pool).await;

    match result {
        Ok(_) => Ok("Job entry moved to the trash successfully".to_string()),
        Err(e) => Err(format!("Failed to move job entry to trash: {}", e)),
    }
}

#[tauri::command]
pub async fn restore_job_entry(db: State<'_, Database>, id: i32) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let query_str = "UPDATE jobs SET insert_status = 'restored' WHERE id = ?";

    let result = sqlx::query(query_str).bind(id).execute(&*pool).await;
    match result {
        Ok(_) => Ok("Job entry restored successfully".to_string()),
        Err(e) => Err(format!("Failed to restore job entry: {}", e)),
    }
}
