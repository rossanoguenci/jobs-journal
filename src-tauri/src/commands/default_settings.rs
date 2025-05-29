use crate::commands::options::{get_option, set_option};
use crate::db::Database;
use crate::models::app_settings::AppSettings;
use tauri::State;

pub async fn ensure_default_settings(db: State<'_, Database>) -> Result<(), String> {
    let existing = get_option(db.clone(), "app_settings").await?;

    if existing.is_none() {
        crate::debug_log!("Creating default app settings");

        let default = AppSettings {
            onboarding_complete: false,
            theme: "system".to_string(),
        };

        // Convert to serde_json::Value
        let default_json = serde_json::to_value(default)
            .map_err(|e| format!("Failed to convert default settings to JSON: {}", e))?;
        
        set_option(db.clone(), "app_settings", default_json).await?;
    }

    Ok(())
}
