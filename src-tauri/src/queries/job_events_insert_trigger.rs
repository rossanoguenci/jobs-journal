use sqlx::SqlitePool;

pub(crate) async fn job_events_insert_trigger(pool: &SqlitePool, job_id: i64) -> Result<(), sqlx::Error> {
    sqlx::query("INSERT INTO job_events (job_id, description, insert_type) VALUES (?, ?, ?)")
        .bind(job_id)
        .bind("Job entry created")
        .bind("automatic")
        .execute(pool)
        .await?;
    Ok(())
}
