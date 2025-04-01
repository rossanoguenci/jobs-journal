use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobEntry {
    id: i64,
    insert_date: String,
    company: String,
    title: String,
    link: String,
    application_date: String,
    status: String,
    insert_status: Option<String>
}

impl JobEntry {
    // Getter methods for each field
    pub fn id(&self) -> i64 {
        self.id
    }

    pub fn insert_date(&self) -> &str {
        &self.insert_date
    }

    pub fn company(&self) -> &str {
        &self.company
    }

    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn link(&self) -> &str {
        &self.link
    }

    pub fn application_date(&self) -> &str {
        &self.application_date
    }

    pub fn status(&self) -> &str {
        &self.status
    }
    pub fn insert_status(&self) -> Option<&str> {
        self.insert_status.as_deref()
    }
}
