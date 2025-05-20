use crate::models::{job_entry::JobEntry, job_event::JobEvent};
use serde::Serialize;

#[derive(Serialize, serde::Deserialize)]
pub struct JobWithEvents {
    pub job: JobEntry,
    pub events: Vec<JobEvent>,
}
