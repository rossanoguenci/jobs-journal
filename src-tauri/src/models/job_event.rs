use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobEvent {
    id: Option<i64>,
    job_id: i64,
    date_of_event: String,
    description: String,
    insert_type: Option<String>,
    insert_date: Option<String>,
}

impl JobEvent {
    // Getter methods for each field
    pub fn id(&self) -> Option<&i64> {
        self.id.as_ref()
    }

    pub fn job_id(&self) -> i64 {
        self.job_id
    }

    pub fn date_of_event(&self) -> &str {
        &self.date_of_event
    }

    pub fn description(&self) -> &str {
        &self.description
    }

    pub fn insert_type(&self) -> Option<&str> {
        self.insert_type.as_deref()
    }

    pub fn insert_date(&self) -> Option<&str> {
        self.insert_date.as_deref()
    }
}
