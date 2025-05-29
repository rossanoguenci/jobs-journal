use tauri::State;
use crate::db::Database;
use serde_json::Value;
use sqlx::Row;

/// Unified get_option: returns JSON Value
#[tauri::command]
pub async fn get_option(
    db: State<'_, Database>,
    key: &str,
) -> Result<Option<Value>, String> {
    let pool = db.pool.lock().await;
    let result = sqlx::query("SELECT value FROM options WHERE key = ?")
        .bind(&key)
        .fetch_optional(&*pool)
        .await
        .map_err(|e| format!("DB error: {}", e))?;

    match result {
        Some(row) => {
            let raw: String = row.get("value");
            serde_json::from_str(&raw)
                .map(Some)
                .map_err(|e| format!("Deserialization error: {}", e))
        }
        None => Ok(None),
    }
}

/// Unified set_option: stores anything as JSON string
#[tauri::command]
pub async fn set_option(
    db: State<'_, Database>,
    key: &str,
    value: Value,
) -> Result<(), String> {
    let json_str = value.to_string();
    let pool = db.pool.lock().await;

    sqlx::query("INSERT OR REPLACE INTO options (key, value) VALUES (?, ?)")
        .bind(&key)
        .bind(&json_str)
        .execute(&*pool)
        .await
        .map_err(|e| format!("DB error: {}", e))?;

    Ok(())
}
