use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobUpdate {
    id: i64,
    company: Option<String>,
    title: Option<String>,
    link: Option<String>,
    application_date: Option<String>,
    status: Option<String>,
}


impl JobUpdate {
    // Getter methods for each field
    pub fn id(&self) -> i64 {
        self.id
    }

    pub fn company(&self) -> Option<&str> {
        self.company.as_deref()
    }

    pub fn title(&self) -> Option<&str> {
        self.title.as_deref()
    }

    pub fn link(&self) -> Option<&str> {
        self.link.as_deref()
    }

    pub fn application_date(&self) -> Option<&str> {
        self.application_date.as_deref()
    }

    pub fn status(&self) -> Option<&str> {
        self.status.as_deref()
    }
}
