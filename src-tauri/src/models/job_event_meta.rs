use serde::{Deserialize, Serialize};
use ts_rs::TS;
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct JobEventMeta {
    #[ts(optional)]
    pub type_of_import: Option<String>,
}
