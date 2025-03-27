use super::Database;
use tauri::State;

#[derive(serde::Deserialize, Debug)]
pub struct JobEvent {
    pub job_id: String,
    pub description: String,
    pub date_of_event: Option<String>,
}

#[tauri::command]
pub async fn job_events_insert(db: State<'_, Database>, data: JobEvent) -> Result<String, String> {
    let pool = db.pool.lock().await;
    let job_id: i64 = data.job_id.parse().unwrap_or_default();

    let date_of_event = data.date_of_event.as_deref().filter(|s| !s.is_empty());

    let query_str = if date_of_event.is_some() {
        "INSERT INTO job_events (job_id, description, insert_type, date_of_event) VALUES (?, ?, ?, ?)"
    } else {
        "INSERT INTO job_events (job_id, description, insert_type) VALUES (?, ?, ?)"
    };

    let mut query = sqlx::query(query_str)
        .bind(job_id)
        .bind(data.description)
        .bind("manual");

    if let Some(date) = date_of_event {
        query = query.bind(date);
    }

    match query.execute(&*pool).await {
        Ok(_) => Ok(format!("JobEntry saved for job_id: {}!", data.job_id)),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}
