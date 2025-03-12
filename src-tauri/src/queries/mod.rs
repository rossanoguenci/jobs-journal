use std::sync::Arc;
use sqlx::SqlitePool;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct Database {
    pub pool: Arc<Mutex<SqlitePool>>,
}

pub mod insert_job_entry;
pub mod get_jobs;
pub mod delete_job_entry;
pub mod trash_job_entry;