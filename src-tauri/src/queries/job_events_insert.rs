use tauri::State;
use super::Database;

#[derive(serde::Deserialize, Debug)]
pub struct JobEvent {
    pub job_id: i64,
    pub description: String,
    pub date_of_event: Option<String>,
}

#[tauri::command]
pub async fn job_events_insert(db: State<'_, Database>, data: JobEvent) -> Result<String, String> {
    let pool = db.pool.lock().await;

    let date_of_event =  data.date_of_event.as_deref().unwrap_or("");

    let query_str = "INSERT INTO job_events (job_id, description, date_of_event) VALUES (?, ?, ?)";

    let mut query = sqlx::query(query_str)
        .bind(data.job_id)
        .bind(data.description);

    if !date_of_event.is_empty() {
        query = query.bind(date_of_event);
    }

    match query.execute(&*pool).await {
        Ok(_) => Ok(format!("JobEntry saved for job_id: {}!",data.job_id)),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
