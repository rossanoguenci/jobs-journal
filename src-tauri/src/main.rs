mod commands;
mod db;
mod models;
mod queries;
mod utils;

use commands::*;
use db::setup_database;
use queries::*;
use tauri::Builder;
use utils::*;

use tauri_plugin_dialog as dialog;
use tauri_plugin_opener as opener;
use tauri_plugin_fs as fileSystem;

#[tokio::main]
async fn main() {
    // Initialise logger
    dev_logger::init_logger();

    Builder::default()
        .setup(|app| {
            paths::set_app_handle(app.handle().clone());

            let db_path = paths::get_app_data_path();

            let app_handle_clone = app.handle().clone();
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
            jobs_upsert,
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
            get_option,
            set_option,
            load_avatar,
            save_avatar,
            delete_avatar,
            get_periods,
            upsert_period,
            remove_period,
        ])
        .plugin(opener::init())
        .plugin(dialog::init())
        .plugin(fileSystem::init())
        .run(tauri::generate_context!())
        .expect("Error running application");
}
