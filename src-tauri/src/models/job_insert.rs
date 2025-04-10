use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobInsert {
    #[ts(optional)]
    pub insert_date: Option<String>,
    pub company: String,
    pub title: String,
    #[ts(optional)]
    pub link: Option<String>,
    #[ts(optional)]
    pub application_date: Option<String>,
    #[ts(optional)]
    pub status: Option<String>,
    #[ts(optional)]
    pub insert_status: Option<String>,
}
