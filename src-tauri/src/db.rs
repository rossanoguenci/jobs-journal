use std::env;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::fs;
use tokio::sync::Mutex;
use sqlx::SqlitePool;
use tauri::{AppHandle, Manager};
use tauri::path::PathResolver;

use crate::queries::Database;

pub fn get_db_path(app_handle: &AppHandle) -> String {
    let base_dir: PathBuf = PathResolver::app_data_dir(app_handle.path())
        .expect("Failed to get app data directory");

    println!("Base directory: {:?}", base_dir);

    fs::create_dir_all(&base_dir).expect("Failed to create app data directory");

    let env_mode = env::var("NEXT_PUBLIC_ENV").unwrap_or_else(|_| "production".to_string());
    let db_filename = match env_mode.as_str() {
        "development" => "dev_jobs_journal.db",
        _ => "jobs_journal.db",
    };

    let db_path = base_dir.join(db_filename);
    println!("Using database: {:?}", db_path);

    db_path.to_str().unwrap().to_string()
}

pub async fn setup_database(db_path: String, app_handle: AppHandle) -> Result<(), sqlx::Error> {
    let database_url = format!("sqlite://{}", db_path);

    if !Path::new(&db_path).exists() {
        fs::File::create(&db_path).expect("Failed to create the database file");
        println!("Database file created at: {}", db_path);
    }

    let pool = SqlitePool::connect(&database_url).await?;

    sqlx::migrate!().run(&pool).await.expect("Migration failed");

    app_handle.manage(Database {
        pool: Arc::new(Mutex::new(pool)),
    });

    println!("Database setup complete!");
    Ok(())
}
