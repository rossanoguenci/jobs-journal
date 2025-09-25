use serde_json::{Map, Value};
use sqlx::{QueryBuilder, Sqlite};

#[derive(Debug)]
pub enum BindValue {
    String(String),
    Integer(i64),
    Float(f64),
    Bool(bool),
}

#[derive(Debug, Clone, Copy)]
pub enum InsertMode {
    Insert,
    // Ignore,
    // Replace,
}

/// Extracts field names and their corresponding values from a JSON object,
/// skipping any null fields.
pub fn extract_fields(obj: &Map<String, Value>) -> (Vec<String>, Vec<BindValue>) {
    let mut columns = vec![];
    let mut values = vec![];

    for (key, value) in obj {
        if value.is_null() {
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

            Value::Object(_) | Value::Array(_) => match serde_json::to_string(value) {
                Ok(json_str) => BindValue::String(json_str),
                Err(_) => continue,
            },

            _ => continue,
        };

        columns.push(key.clone());
        values.push(bind_value);
    }

    // Debug log for terminal visibility
    crate::debug_log!(
        "extract_fields → columns: {:?}, values_len: {}",
        columns,
        values.len()
    );

    (columns, values)
}

pub fn build_update_set_clause<'a>(
    table_name: &str,
    obj: &'a Map<String, Value>,
) -> Result<(QueryBuilder<'a, Sqlite>, usize), String> {
    crate::debug_log!("Update object: {:?}", obj);

    let (columns, values) = extract_fields(obj);

    if columns.is_empty() {
        crate::debug_log!(
            "build_update_set_clause('{}') → No updatable fields found",
            table_name
        );
        return Err("No updatable fields found".into());
    }

    crate::debug_log!(
        "build_update_set_clause('{}') → columns: {:?}, values_len: {}",
        table_name,
        columns,
        values.len()
    );

    let mut query_builder = QueryBuilder::<Sqlite>::new(format!("UPDATE {} SET ", table_name));

    for (i, column) in columns.iter().enumerate() {
        if i > 0 {
            query_builder.push(", ");
        }

        if column == "meta" {
            // Create a JSON object with only the non-null fields
            let meta_value = obj.get("meta")
                .and_then(|v| v.as_object())
                .ok_or_else(|| "Invalid meta field".to_string())?;
            
            // Build a JSON object containing only non-null fields
            let patch_obj: Map<String, Value> = meta_value
                .iter()
                .filter(|(_, v)| !v.is_null())
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect();

            // Convert the patch object to a JSON string
            let patch_json = serde_json::to_string(&patch_obj)
                .map_err(|e| format!("Failed to serialize meta patch: {}", e))?;

            // Use json_patch to merge only the provided fields
            query_builder.push("meta = json_patch(COALESCE(meta, '{}'), ");
            query_builder.push_bind(patch_json);
        } else {
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

        if column == "meta" {
            query_builder.push(")");
        }
    }
    

    Ok((query_builder, values.len()))
}

/// Builds a full INSERT ... query for a given table and fields and mode.
pub fn build_insert_query_with_mode<'a>(
    table_name: &str,
    obj: &Map<String, Value>,
    mode: InsertMode,
) -> Result<QueryBuilder<'static, Sqlite>, String> {
    let (columns, values) = extract_fields(obj);

    if columns.is_empty() {
        crate::debug_log!(
            "build_insert_query_with_mode('{}', mode={:?}) → No insertable fields found",
            table_name,
            mode
        );
        return Err("No insertable fields found".into());
    }

    crate::debug_log!(
        "build_insert_query_with_mode('{}', mode={:?}) → columns: {:?}, values_len: {}",
        table_name,
        mode,
        columns,
        values.len()
    );

    let insert_clause = match mode {
        // InsertMode::Ignore => "INSERT OR IGNORE INTO",
        // InsertMode::Replace => "INSERT OR REPLACE INTO",
        InsertMode::Insert => "INSERT INTO", //Typically default
    };

    let mut builder = QueryBuilder::<Sqlite>::new(format!("{} {} (", insert_clause, table_name));

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

//Shorthand version for INSERT INTO
pub fn build_insert_query<'a>(
    table_name: &str,
    obj: &Map<String, Value>,
) -> Result<QueryBuilder<'static, Sqlite>, String> {
    build_insert_query_with_mode(table_name, obj, InsertMode::Insert)
}