use std::sync::Arc;
use sqlx::SqlitePool;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Database {
    pub pool: Arc<Mutex<SqlitePool>>,
}

//Jobs list
pub mod jobs_insert;
pub mod jobs_get;
pub mod jobs_delete;
pub mod jobs_archive_restore;

// Job events list
pub mod job_events_insert;
pub mod job_events_update;
pub mod job_events_delete;
pub mod job_events_get;

// Re-export functions for easy access
pub use jobs_insert::jobs_insert;
pub use jobs_delete::delete_job_entry;
pub use jobs_get::{jobs_get_list, jobs_get_details};
pub use jobs_archive_restore::{archive_job_entry, restore_job_entry};
pub use job_events_insert::{job_events_insert};
// pub use job_events_update::{job_events_update}; //todo: to be developed
// pub use job_events_delete::{job_events_delete}; //todo: to be developed
pub use job_events_get::{job_events_get};