use serde::{Deserialize, Serialize};
use ts_rs::TS;
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct JobEntryMeta {
    #[ts(optional)]
    pub period_id: Option<String>,
    #[ts(optional)]
    pub note: Option<String>,
    #[ts(optional)]
    pub location: Option<String>,
    #[ts(optional)]
    pub link_to_job_posting: Option<String>,
}
