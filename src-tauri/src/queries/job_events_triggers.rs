use sqlx::SqlitePool;

pub(crate) async fn insert(
    pool: &SqlitePool,
    job_id: i64,
    description: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO job_events (job_id, description, insert_type) VALUES (?, ?, ?)")
        .bind(job_id)
        .bind(description)
        .bind("automatic")
        .execute(pool)
        .await?;
    Ok(())
}
