use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, TS)]
#[ts(export)]
pub struct JobEvent {
    #[ts(optional)]
    pub id: Option<String>,
    pub job_id: String,
    pub date_of_event: String,
    pub description: String,
    #[ts(optional)]
    pub insert_type: Option<String>,
    #[ts(optional)]
    pub insert_date: Option<String>,
}
