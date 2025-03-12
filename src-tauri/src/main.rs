mod queries;

use tauri::{Manager, Builder};
use std::path::PathBuf;
use sqlx::SqlitePool;
use std::sync::Arc;
use std::fs;
use std::path::Path;
use tokio::sync::Mutex;

use tauri::path::PathResolver;

//Queries
use queries::Database;
use queries::insert_job_entry::insert_job_entry;
use queries::delete_job_entry::delete_job_entry;
use queries::get_jobs::get_jobs;
use queries::trash_job_entry::{trash_job_entry,restore_job_entry};

fn get_db_path(app_handle: &tauri::AppHandle) -> String {
    let base_dir: PathBuf = PathResolver::app_data_dir(app_handle.path()).expect("Failed to get app data directory");
    println!("Base directory: {:?}", base_dir);

    // Ensure the directory exists
    std::fs::create_dir_all(&base_dir).expect("Failed to create app data directory");

    // Construct the database file path
    let db_path: PathBuf = base_dir.join("jobs_journal.db");
    println!("Database path: {:?}", db_path);

    db_path.to_str().unwrap().to_string()
}

async fn setup_database(db_path: String, app_handle: tauri::AppHandle) -> Result<(), sqlx::Error> {
    let database_url = format!("sqlite://{}", db_path);

    // Create DB file if it doesn't exist
    if !Path::new(&db_path).exists() {
        fs::File::create(&db_path).expect("Failed to create the database file");
        println!("Database file created at: {}", db_path);
    }

    // Connect to database
    let pool = SqlitePool::connect(&database_url).await?;

    // Run pending migrations (only applies changes if needed)
    sqlx::migrate!().run(&pool).await.expect("Migration failed");

    // Store database pool in Tauri state
    app_handle.manage(Database {
        pool: Arc::new(Mutex::new(pool)),
    });

    println!("Database setup complete!");
    Ok(())
}

#[tokio::main]
async fn main() {
    Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            let db_path = get_db_path(&app_handle);

            // Run database setup in async task
            let app_handle_clone = app_handle.clone();
            tokio::spawn(async move {
                if let Err(err) = setup_database(db_path, app_handle_clone).await {
                    eprintln!("Database setup failed: {:?}", err);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            insert_job_entry,
            get_jobs,
            delete_job_entry,
            trash_job_entry,
            restore_job_entry,
        ])
        .run(tauri::generate_context!())
        .expect("Error running Tauri application");
}
