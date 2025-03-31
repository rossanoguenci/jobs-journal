use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobEvent {
    id: i64,
    job_id: i64,
    date_of_event: String,
    description: String,
    insert_type: String,
    insert_date: String,
}

impl JobEvent {
    // Getter methods for each field
    pub fn id(&self) -> i64 {
        self.id
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

    pub fn insert_type(&self) -> &str {
        &self.insert_type
    }

    pub fn insert_date(&self) -> &str {
        &self.insert_date
    }
}
