use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[ts(export)]
pub struct JobPeriod {
    pub id: String,
    pub start: String,
    #[ts(optional)]
    pub end: Option<String>,
}
