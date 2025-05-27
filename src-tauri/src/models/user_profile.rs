use serde::{Deserialize, Serialize};
use ts_rs::TS;
#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UserProfile {
    pub id: String,
    pub name: String,
    #[ts(optional)]
    pub avatar: Option<String>,
}
