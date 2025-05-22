use serde::{Deserialize, Serialize};
use crate::models::job_entry_meta::JobEntryMeta;
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobEntry {
    pub id: String,
    pub insert_date: String,
    pub company: String,
    pub title: String,
    pub application_date: String,
    pub status: String,
    pub insert_status: String,
    // pub last_updated_at: String,
    #[sqlx(json)]
    pub meta: JobEntryMeta,
}
