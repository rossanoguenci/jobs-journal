use std::path::{Path};
use std::sync::Arc;
use std::fs;
use tokio::sync::Mutex;
use sqlx::SqlitePool;
use tauri::{AppHandle, Manager};
use crate::queries::Database;

#[cfg(feature = "dev")]
pub fn get_db_path() -> String {
    use std::env;
    
    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Move up one level from `src-tauri/` to `jobs-journal/`
    let project_root = current_dir.parent().expect("Failed to find project root");

    let db_path = project_root.join("src-tauri-dev-tools").join("dev_jobs_journal.db");

    db_path.to_str().unwrap().to_string()
}


#[cfg(not(feature = "dev"))]
pub fn get_db_path(app_handle: &AppHandle) -> String {
    let base_dir = app_handle.path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    let db_path = base_dir.join("jobs_journal.db");
    db_path.to_str().unwrap().to_string()
}



pub async fn setup_database(db_path: String, app_handle: AppHandle) -> Result<(), sqlx::Error> {
    let database_url = format!("sqlite://{}", db_path);

    println!("Database path: {}", db_path);

    if !Path::new(&db_path).exists() {
        fs::File::create(&db_path).expect("Failed to create the database file");
        println!("Database file created");
    }

    let pool = SqlitePool::connect(&database_url).await?;

    sqlx::migrate!().run(&pool).await.expect("Migration failed");
    
    app_handle.manage(Database {
        pool: Arc::new(Mutex::new(pool)),
    });

    println!("Database setup complete!");
    Ok(())
}
