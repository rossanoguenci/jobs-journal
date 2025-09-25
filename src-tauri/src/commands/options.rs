use crate::db::Database;
use serde_json::Value;
use sqlx::Row;
use tauri::State;

/// Unified get_option: returns JSON Value
#[tauri::command]
pub async fn get_option(db: State<'_, Database>, key: &str) -> Result<Option<Value>, String> {
    let pool = db.pool.lock().await;
    let result = sqlx::query("SELECT value FROM options WHERE key = ?")
        .bind(&key)
        .fetch_optional(&*pool)
        .await
        .map_err(|e| format!("DB error: {}", e))?;

    crate::debug_log!(
        "get_option() - Result for key {:?} : {:?} ",
        key,
        if result.is_some() {
            "Some(row)"
        } else {
            "None"
        }
    );

    match result {
        Some(row) => {
            let raw: String = row.get("value");

            crate::debug_log!("Result for key {:?} -> Some(value: {:?})", key, raw);

            if raw.trim().is_empty() {
                // Empty DB value is not valid JSON; treat as no value.
                crate::debug_log!(
                    "Empty JSON string for key {:?}, returning None (no value)",
                    key
                );
                return Ok(None);
            }

            serde_json::from_str(&raw)
                .map(Some)
                .map_err(|e| format!("Deserialization error: {}", e))
        }
        None => Ok(None),
    }
}

/// Unified set_option: stores anything as a JSON string
#[tauri::command]
pub async fn set_option(db: State<'_, Database>, key: &str, value: Value) -> Result<(), String> {
    crate::debug_log!(
        "set_option() - Updating DB with data: {{key: {:?}, value: {:?}}}",
        key,
        value
    );

    let pool = db.pool.lock().await;

    let existing = sqlx::query("SELECT value FROM options WHERE key = ?")
        .bind(key)
        .fetch_optional(&*pool)
        .await
        .map_err(|e| format!("DB read error: {}", e))?;

    let merged_value = if let Some(row) = existing {
        let raw: String = row.get("value");
        let mut existing_json: Value =
            serde_json::from_str(&raw).map_err(|e| format!("Deserialization error: {}", e))?;

        match (&mut existing_json, &value) {
            (Value::Object(existing_obj), Value::Object(new_obj)) => {
                for (k, v) in new_obj {
                    existing_obj.insert(k.clone(), v.clone());
                }
                existing_json
            }
            _ => value.clone(), // fallback to replacing the whole value
        }
    } else {
        value.clone()
    };

    let json_str = merged_value.to_string();

    crate::debug_log!("set_option() - json_str: {:?}", json_str);

    sqlx::query("INSERT OR REPLACE INTO options (key, value) VALUES (?, ?)")
        .bind(key)
        .bind(json_str)
        .execute(&*pool)
        .await
        .map_err(|e| format!("DB write error: {}", e))?;

    Ok(())
}
