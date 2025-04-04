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

    // Get the number of applied migrations before running new ones
    let applied_migrations_before: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sqlx_migrations")
        .fetch_one(&pool)
        .await
        .unwrap_or(0);

    sqlx::migrate!().run(&pool).await.expect("Migration failed");

    // Get the number of applied migrations after running
    let applied_migrations_after: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM sqlx_migrations")
        .fetch_one(&pool)
        .await
        .unwrap_or(0);

    if applied_migrations_after > applied_migrations_before {
        println!(
            "Migrations applied: {} new migrations performed.",
            applied_migrations_after - applied_migrations_before
        );
    } else {
        println!("No new migrations were performed.");
    }


    app_handle.manage(Database {
        pool: Arc::new(Mutex::new(pool)),
    });

    println!("Database setup complete!");
    Ok(())
}
