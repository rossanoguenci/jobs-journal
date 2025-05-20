use crate::db::Database;
use tauri::State;
use sqlx::query;

#[tauri::command]
pub async fn check_ready(db: State<'_, Database>) -> Result<(), String> {
    // 1. Ping DB
    let pool = db.pool.lock().await;

    query("SELECT 1")
        .execute(&*pool)
        .await
        .map_err(|e| format!("DB ping failed: {}", e))?;


    // Finally
    println!("App is ready!");
    Ok(())
}
