use crate::db::Database;
use tauri::State;
use serde::{Serialize, de::DeserializeOwned};
use serde_json;
use sqlx::Row;
use crate::models::app_settings::AppSettings;

/// Fetch a plain string option
#[tauri::command]
pub async fn get_option(db: State<'_, Database>, key: &str) -> Result<Option<String>, String> {
    let pool = db.pool.lock().await;

    sqlx::query("SELECT value FROM options WHERE key = ?")
        .bind(&key)
        .fetch_optional(&*pool)
        .await
        .map(|row_opt| row_opt.map(|row| row.get::<String, _>("value")))
        .map_err(|e| format!("Failed to fetch option: {}", e))
}

/// Set a plain string option
#[tauri::command]
pub async fn set_option(db: State<'_, Database>, key: &str, value: &str) -> Result<(), String> {
    let pool = db.pool.lock().await;

    sqlx::query("INSERT OR REPLACE INTO options (key, value) VALUES (?, ?)")
        .bind(&key)
        .bind(&value)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Failed to set option: {}", e))?;

    Ok(())
}

/// Fetch and deserialize JSON option
#[tauri::command]
pub async fn load_app_settings(
    db: State<'_, Database>,
) -> Result<Option<AppSettings>, String> {
    get_option_json::<AppSettings>(db, "app_settings").await
}

/// Serialize and set option as JSON
#[tauri::command]
pub async fn save_app_settings(
    db: State<'_, Database>,
    settings: AppSettings,
) -> Result<(), String> {
    set_option_json(db, "app_settings", &settings).await
}

// --- generic helpers ---

pub async fn get_option_json<T: DeserializeOwned>(
    db: State<'_, Database>,
    key: &str,
) -> Result<Option<T>, String> {
    match get_option(db.clone(), key).await? {
        Some(json_str) => {
            let parsed = serde_json::from_str(&json_str)
                .map_err(|e| format!("Failed to parse JSON: {}", e))?;
            Ok(Some(parsed))
        }
        None => Ok(None),
    }
}

pub async fn set_option_json<T: Serialize>(
    db: State<'_, Database>,
    key: &str,
    value: &T,
) -> Result<(), String> {
    let json_str = serde_json::to_string(value)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    set_option(db, key, &json_str).await
}
