use crate::commands::default_settings::ensure_default_settings;
use sqlx::SqlitePool;
use std::fs;
use std::path::Path;
use std::sync::Arc;
use tauri::{AppHandle, Manager, async_runtime};
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Database {
    pub pool: Arc<Mutex<SqlitePool>>,
}

pub async fn setup_database(app_dir_path: String, app_handle: AppHandle) -> Result<(), sqlx::Error> {

    #[cfg(feature = "dev")]
    let db_name = "dev_jobs_journal.db";
    
    #[cfg(not(feature = "dev"))] 
    let db_name = "jobs_journal.db";
    
    let db_path=app_dir_path.clone() + "/" + db_name;
    
    let database_url = format!("sqlite://{}", db_path);

    crate::debug_log!("Database path: {}", db_path);

    if !Path::new(&db_path).exists() {
        fs::File::create(&db_path).expect("Failed to create the database file");
        crate::debug_log!("Database file created");
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
        crate::debug_log!(
            "Migrations applied: {} new migrations performed.",
            applied_migrations_after - applied_migrations_before
        );
    } else {
        crate::debug_log!("No new migrations were performed.");
    }

    app_handle.manage(Database {
        pool: Arc::new(Mutex::new(pool)),
    });
    
    let app_handle_clone = app_handle.clone();
    
    async_runtime::spawn(async move {
        let db = app_handle_clone.state::<Database>().clone();
        if let Err(e) = ensure_default_settings(db).await {
            eprintln!("Failed to ensure default settings: {}", e);
        }
    });

    crate::debug_log!("Database setup complete!");
    Ok(())
}
