use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobEntry {
    pub id: String,
    pub insert_date: String,
    pub company: String,
    pub title: String,
    #[ts(optional)]
    pub link: Option<String>,
    pub application_date: String,
    pub status: String,
    pub insert_status: String,
    #[ts(optional)]
    pub location: Option<String>,
    #[ts(optional)]
    pub note: Option<String>,
}
