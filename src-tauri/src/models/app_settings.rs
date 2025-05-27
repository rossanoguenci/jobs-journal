use serde::{Deserialize, Serialize};
use ts_rs::TS;
#[derive(Serialize, Deserialize, TS)]
#[ts(export)]
pub struct AppSettings {
    pub onboarding_complete: bool,
    pub theme: String,
}
