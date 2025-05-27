use tauri::State;
use crate::db::Database;
use crate::commands::options::{get_option_json, set_option_json};
use crate::models::app_settings::AppSettings;

pub async fn ensure_default_settings(db: State<'_, Database>) -> Result<(), String> {
    let db_ref = db.clone();
    
    let existing = get_option_json::<AppSettings>(db, "app_settings").await?;

    if existing.is_none() {
        crate::debug_log!("Creating default app settings");
        
        let default = AppSettings {
            onboarding_complete: false,
            theme: "system".to_string(),
        };
        set_option_json(db_ref, "app_settings", &default).await?;
    }

    Ok(())
}
