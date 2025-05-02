use super::Database;
use tauri::State;

#[tauri::command]
pub async fn jobs_archive_entry(db: State<'_, Database>, id: String) -> Result<String, String> {
    println!("jobs_archive_entry invoked {}",id);

    let pool = db.pool.lock().await;

    let query_str = "UPDATE jobs SET insert_status = 'archived' WHERE id = ?";

    let result = sqlx::query(query_str).bind(id).execute(&*pool).await;

    match result {
        Ok(_) => Ok("Job entry archived successfully".to_string()),
        Err(e) => Err(format!("Failed to archive job entry: {}", e)),
    }
}

#[tauri::command]
pub async fn jobs_restore_entry(db: State<'_, Database>, id: String) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let query_str = "UPDATE jobs SET insert_status = 'restored' WHERE id = ?";

    let result = sqlx::query(query_str).bind(id).execute(&*pool).await;
    match result {
        Ok(_) => Ok("Job entry restored successfully".to_string()),
        Err(e) => Err(format!("Failed to restore job entry: {}", e)),
    }
}
