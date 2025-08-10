use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::models::job_period::JobPeriod;
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct JobEntryMeta {
    pub period_id: String,
    #[ts(optional)]
    pub note: Option<String>,
    #[ts(optional)]
    pub location: Option<String>,
    #[ts(optional)]
    pub link_to_job_posting: Option<String>,
}
