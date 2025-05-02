use tauri::State;
use super::Database;

// This should be invoked to delete data from trash/hidden status. todo: But first, remove related entries.
#[tauri::command]
pub async fn delete_job_entry(db: State<'_, Database>, id: String) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let query_str = "DELETE FROM jobs WHERE id = ?";

    let result = sqlx::query(query_str)
        .bind(id)
        .execute(&*pool)
        .await;

    match result {
        Ok(_) => Ok("Job deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete job: {}", e)),
    }
}
