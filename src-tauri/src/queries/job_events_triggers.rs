use sqlx::SqlitePool;
use uuid::Uuid;

pub(crate) async fn insert(
    pool: &SqlitePool,
    job_id: &str,
    description: &str,
) -> Result<(), sqlx::Error> {
    let uuid = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO job_events (id, job_id, description, insert_type) VALUES (?, ?, ?, ?)")
        .bind(uuid)
        .bind(job_id)
        .bind(description)
        .bind("automatic")
        .execute(pool)
        .await?;
    Ok(())
}
