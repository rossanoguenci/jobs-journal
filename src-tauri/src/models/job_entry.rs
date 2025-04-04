use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobEntry {
    pub id: i64,
    pub insert_date: String,
    pub company: String,
    pub title: String,
    #[ts(optional)]
    pub link: Option<String>,
    pub application_date: String,
    pub status: String,
    pub insert_status: String,
}
