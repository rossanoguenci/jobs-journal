use super::Database;
use crate::models::{export::JobWithEvents, job_entry::JobEntry, job_event::JobEvent};
use tauri::State;

pub async fn fetch_all_jobs_with_events(
    db: State<'_, Database>,
) -> Result<Vec<JobWithEvents>, String> {
    let pool = db.pool.lock().await;

    let jobs: Vec<JobEntry> = sqlx::query_as::<_, JobEntry>("SELECT * FROM jobs")
        .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();

    for job in jobs {
        let events: Vec<JobEvent> =
            sqlx::query_as::<_, JobEvent>("SELECT * FROM job_events WHERE job_id = ?")
                .bind(&job.id)
                .fetch_all(&*pool)
                .await
                .map_err(|e| e.to_string())?;

        result.push(JobWithEvents { job, events });
    }

    Ok(result)
}

