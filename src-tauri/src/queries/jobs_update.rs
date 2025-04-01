use super::Database;
use crate::models::job_update::JobUpdate;
use tauri::State;
use sqlx::{QueryBuilder, Sqlite};
use serde_json::Value;


#[tauri::command]
pub async fn jobs_update(db: State<'_, Database>, data: JobUpdate) -> Result<String, String> {
    let pool = db.pool.lock().await;
    let job_id = data.id();

    // Convert the update object into JSON to iterate dynamically.
    let serialized = serde_json::to_value(&data).map_err(|e| e.to_string())?;
    let obj = serialized.as_object().ok_or("Failed to parse data")?;

    let mut query_builder = QueryBuilder::<Sqlite>::new("UPDATE jobs SET ");
    let mut first = true;

    // Iterate over each key/value pair.
    for (key, value) in obj.iter() {
        // Skip the id field and any null value.
        if key == "id" || value.is_null() {
            continue;
        }

        // Add a comma if this isn't the first field.
        if !first {
            query_builder.push(", ");
        }

        query_builder.push(format!("{} = ", key));

        // Bind the value based on its type.
        match value {
            Value::String(s) => {
                query_builder.push_bind(s);
            },
            Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    query_builder.push_bind(i);
                } else if let Some(f) = n.as_f64() {
                    query_builder.push_bind(f);
                }
            },
            Value::Bool(b) => {
                query_builder.push_bind(*b);
            },
            _ => {
                // You might want to handle other types (arrays, objects) if needed.
                continue;
            }
        }

        first = false;
    }

    if first {
        return Err("Nothing to update".to_string());
    }

    // Append the WHERE clause for the specific job entry.
    query_builder.push(" WHERE id = ").push_bind(job_id);

    let built_query = query_builder.build();

    // Execute the query.
    match built_query.execute(&*pool).await {
        Ok(_) => Ok(format!("Updated job entry {} successfully", job_id)),
        Err(e) => Err(format!("Database error: {}", e)),
    }
}