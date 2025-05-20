use crate::utils::parse_from_csv::load_jobs_from_csv;
use crate::{db::Database, utils::query_utils::build_insert_query};
use tauri::State;

/// Command to import jobs plus events from CSV
#[tauri::command]
pub async fn import_jobs_csv(path: String, db: State<'_, Database>) -> Result<String, String> {
    crate::debug_log!("import_jobs_csv() - path: {:?}", path);

    let pool = db.pool.lock().await;
    let jobs = load_jobs_from_csv(&path)?;

    for job_with_events in jobs {
        let job_val = serde_json::to_value(&job_with_events.job).map_err(|e| e.to_string())?;
        let job_obj = job_val.as_object().ok_or("Invalid job")?;
        let mut builder = build_insert_query("jobs", job_obj)?;
        let query = builder.build();
        query.execute(&*pool).await.map_err(|e| e.to_string())?;

        for event in job_with_events.events {
            let val = serde_json::to_value(&event).map_err(|e| e.to_string())?;
            let obj = val.as_object().ok_or("Invalid event format")?;
            let mut builder = build_insert_query("job_events", obj)?;
            let query = builder.build();
            query.execute(&*pool).await.map_err(|e| e.to_string())?;
        }
    }

    Ok("CSV import completed successfully.".into())
}
