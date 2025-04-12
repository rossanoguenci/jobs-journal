use serde_json::{Map, Value};
use sqlx::{QueryBuilder, Sqlite};

#[derive(Debug)]
pub enum BindValue {
    String(String),
    Integer(i64),
    Float(f64),
    Bool(bool),
}

/// Extracts field names and their corresponding values from a JSON object,
/// skipping any null or `id` fields.
pub fn extract_fields(obj: &Map<String, Value>) -> (Vec<String>, Vec<BindValue>) {
    let mut columns = vec![];
    let mut values = vec![];

    for (key, value) in obj {
        if key == "id" || value.is_null() {
            continue;
        }

        let bind_value = match value {
            Value::String(s) => BindValue::String(s.clone()),
            Value::Number(n) => {
                if let Some(i) = n.as_i64() {
                    BindValue::Integer(i)
                } else if let Some(f) = n.as_f64() {
                    BindValue::Float(f)
                } else {
                    continue;
                }
            }
            Value::Bool(b) => BindValue::Bool(*b),
            _ => continue, // Skip arrays or nested objects for now
        };

        columns.push(key.clone());
        values.push(bind_value);
    }

    (columns, values)
}


/// Builds a dynamic UPDATE SET clause (without the WHERE clause).
pub fn build_update_set_clause<'a>(
    table_name: &str,
    obj: &'a Map<String, Value>,
) -> Result<(QueryBuilder<'a, Sqlite>, usize), String> {
    let (columns, values) = extract_fields(obj);

    if columns.is_empty() {
        return Err("No updatable fields found".into());
    }

    let mut query_builder = QueryBuilder::<Sqlite>::new(format!("UPDATE {} SET ", table_name));

    for (i, column) in columns.iter().enumerate() {
        if i > 0 {
            query_builder.push(", ");
        }
        query_builder.push(format!("{} = ", column));

        match &values[i] {
            BindValue::String(s) => {
                query_builder.push_bind(s.clone());
            }
            BindValue::Integer(i) => {
                query_builder.push_bind(*i);
            }
            BindValue::Float(f) => {
                query_builder.push_bind(*f);
            }
            BindValue::Bool(b) => {
                query_builder.push_bind(*b);
            }
        }
    }

    Ok((query_builder, values.len()))
}


/// Builds a full INSERT INTO ... query for a given table and fields.
pub fn build_insert_query<'a>(
    table_name: &str,
    obj: &Map<String, Value>,
) -> Result<QueryBuilder<'static, Sqlite>, String> {
    let (columns, values) = extract_fields(obj);

    if columns.is_empty() {
        return Err("No insertable fields found".into());
    }

    let mut builder = QueryBuilder::<Sqlite>::new(format!("INSERT INTO {} (", table_name));

    // Columns
    for (i, column) in columns.iter().enumerate() {
        if i > 0 {
            builder.push(", ");
        }
        builder.push(column);
    }

    builder.push(") VALUES (");

    // Bind placeholders
    for i in 0..columns.len() {
        if i > 0 {
            builder.push(", ");
        }

        match &values[i] {
            BindValue::String(s) => builder.push_bind(s.clone()),
            BindValue::Integer(i) => builder.push_bind(*i),
            BindValue::Float(f) => builder.push_bind(*f),
            BindValue::Bool(b) => builder.push_bind(*b),
        };
    }

    builder.push(")");

    Ok(builder)
}
