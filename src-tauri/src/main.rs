mod commands;
mod db;
mod models;
mod queries;
mod utils;

use db::{get_db_path, setup_database};
use queries::*;
use tauri::Builder;
use utils::*;
use commands::*;

use tauri_plugin_dialog as dialog;
use tauri_plugin_opener as opener;



#[tokio::main]
async fn main() {
    // Initialise logger
    dev_logger::init_logger();

    Builder::default()
        .setup(|app| {
            let app_handle = app.handle();

            #[cfg(feature = "dev")]
            let db_path = get_db_path();

            #[cfg(not(feature = "dev"))]
            let db_path = get_db_path(app_handle);

            let app_handle_clone = app_handle.clone();
            tokio::spawn(async move {
                if let Err(err) = setup_database(db_path, app_handle_clone).await {
                    eprintln!("Database setup failed: {:?}", err);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // check_ready,
            jobs_insert,
            jobs_update,
            jobs_get_list,
            jobs_get_details,
            delete_job_entry,
            jobs_archive_entry,
            jobs_restore_entry,
            job_events_insert,
            job_events_get,
            export_jobs_json,
            import_jobs_json,
            import_jobs_csv,
            clear_database,
        ])
        .plugin(opener::init())
        .plugin(dialog::init())
        .run(tauri::generate_context!())
        .expect("Error running application");
}
