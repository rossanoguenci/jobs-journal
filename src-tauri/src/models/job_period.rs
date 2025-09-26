use serde::{Deserialize, Serialize};
use ts_rs::TS;
use crate::commands::get_periods;

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[ts(export)]
pub struct JobPeriod {
    pub id: String,
    pub start: String,
    #[ts(optional)]
    pub end: Option<String>,
}

/// Response payload for [`get_periods`].
///
/// - `periods` contains all stored periods.
/// - `selected` is the currently selected period id (empty string if none).
#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
pub struct PeriodsResponse {
    /// All stored job periods.
    pub periods: Vec<JobPeriod>,
    /// The currently selected period id (maybe empty if none selected).
    pub selected: String,
}
