use crate::db::Database;
use crate::models::job_period::JobPeriod;
use crate::utils::id::generate_id;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PeriodsResponse {
    pub periods: Vec<JobPeriod>,
    pub selected: String,
}

const PERIODS_KEY: &str = "job_periods";
const SELECTED_PERIOD_KEY: &str = "job_period_selected";

#[tauri::command]
pub async fn get_periods(db: State<'_, Database>) -> Result<PeriodsResponse, String> {
    crate::info_log!("get_periods()");

    // Get periods and selected period from options using the get_option function
    let periods_value = crate::commands::options::get_option(db.clone(), PERIODS_KEY).await?;
    let selected_value = crate::commands::options::get_option(db.clone(), SELECTED_PERIOD_KEY).await?;

    crate::debug_log!("get_periods() - periods_value: {:#?}", periods_value);
    crate::debug_log!("get_periods() - selected_value: {:#?}", selected_value);

    // Parse periods as Vec<JobPeriod>
    let periods = match periods_value {
        Some(Value::Array(periods_array)) => periods_array
            .into_iter()
            .filter_map(|v| {
                match serde_json::from_value::<JobPeriod>(v.clone()) {
                    Ok(period) => Some(period),
                    Err(e) => {
                        crate::error_log!("Failed to deserialize period: {:?}, error: {}", v, e);
                        None
                    }
                }
            })
            .collect::<Vec<JobPeriod>>(),
        _ => Vec::new(),
    };

    // Extract the selected string, or default to an empty string
    let selected = match selected_value {
        Some(Value::String(s)) => s,
        _ => String::new(),
    };

    crate::debug_log!("get_periods() - periods: {:#?}", periods);
    crate::debug_log!("get_periods() - selected: {:#?}", selected);

    Ok(PeriodsResponse { periods, selected })
}

#[tauri::command]
pub async fn upsert_period(db: State<'_, Database>, period_value: Value) -> Result<(), String> {
    crate::debug_log!("upsert_period() - period_value: {:#?}", period_value);

    // Get periods
    let periods_value = crate::commands::options::get_option(db.clone(), PERIODS_KEY).await?;

    // Parse periods as Vec<Value>
    let mut periods = match periods_value {
        Some(Value::Array(periods_array)) => periods_array,
        _ => Vec::new(),
    };

    // To know whether we should update the selected period after an add
    let mut newly_added_id: Option<String> = None;

    // Check if period has an ID
    let has_id = period_value.get("id")
        .and_then(|id| id.as_str())
        .map(|id| !id.is_empty())
        .unwrap_or(false);

    if has_id {
        // This is an edit operation
        crate::info_log!("This is an edit operation");

        // Extract the period id
        let period_id = period_value.get("id")
            .and_then(|id| id.as_str())
            .unwrap();  // Safe because we checked has_id

        // Find and update the period with matching id
        let mut found = false;

        for p in &mut periods {
            if let Some(id) = p.get("id").and_then(|id| id.as_str()) {
                if id == period_id {
                    // Merge update: update only fields present in period_value (excluding "id"),
                    // preserving other existing fields on the period.
                    match (p.as_object_mut(), period_value.as_object()) {
                        (Some(existing), Some(incoming)) => {
                            for (k, v) in incoming.iter() {
                                if k != "id" {
                                    existing.insert(k.clone(), v.clone());
                                }
                            }
                        }
                        // If either side is not an object, fall back to the previous behaviour of replacing,
                        // but make sure we do not overwrite the id of the existing object.
                        _ => {
                            let mut new_value = period_value.clone();
                            // Ensure we keep the existing id
                            if let Some(existing_id) = p.get("id").cloned() {
                                if let Some(obj) = new_value.as_object_mut() {
                                    obj.insert("id".to_string(), existing_id);
                                } else {
                                    // If incoming isn't an object, just keep existing as-is
                                    // to avoid data loss.
                                    // Return an error message to the user.
                                    crate::error_log!("Period with ID {} was found but not updated", period_id);
                                    return Err(format!("Period with ID {} was found but not updated", period_id));
                                }
                            }
                            *p = new_value;
                        }
                    }
                    found = true;
                    break;
                }
            }
        }

        // If a period wasn't found, return an error
        if !found {
            crate::error_log!("Period with id {} not found", period_id);
            return Err(format!("Period with id {} not found", period_id));
        }
    } else {
        // This is an add operation
        crate::info_log!("This is an add operation");
        // Generate a new ID
        let new_id = generate_id();

        // Create a mutable copy of the period value
        let mut period_obj = match period_value.clone() {
            Value::Object(obj) => obj,
            _ => return Err("Period value must be an object".to_string()),
        };

        // Add the ID to the period
        period_obj.insert("id".to_string(), Value::String(new_id.clone()));
        let updated_period_value = Value::Object(period_obj);

        // Check if a period with the same id already exists (shouldn't happen with a new UUID, but just to be safe)
        for p in &periods {
            if let Some(id) = p.get("id").and_then(|id| id.as_str()) {
                if id == new_id {
                    crate::error_log!("Period with id {} already exists", new_id);
                    return Err(format!("Period with id {} already exists", new_id));
                }
            }
        }

        // Add the new period
        periods.push(updated_period_value);
        // Mark this new id to be set as selected
        newly_added_id = Some(new_id);
    }

    // Save updated periods
    let periods_value = Value::Array(periods.clone());
    crate::commands::options::set_option(db.clone(), PERIODS_KEY, periods_value).await?;

    // If we added a new period, update the selected period option to the new id
    if let Some(id) = newly_added_id {
        crate::info_log!("Setting selected period to newly added id: {}", id);
        crate::commands::options::set_option(db.clone(), SELECTED_PERIOD_KEY, Value::String(id)).await?;
    }

    crate::info_log!("upsert_period() - done");

    Ok(())
}

#[tauri::command]
pub async fn remove_period(db: State<'_, Database>, period_id: String) -> Result<(), String> {
    crate::debug_log!("remove_period() - period_id: {}", period_id);

    // Get periods
    let periods_value = crate::commands::options::get_option(db.clone(), PERIODS_KEY).await?;

    // Parse periods as Vec<Value>
    let mut periods = match periods_value {
        Some(Value::Array(periods_array)) => periods_array,
        _ => Vec::new(),
    };

    // Find the index of the period to remove
    let initial_len = periods.len();
    periods.retain(|p| {
        if let Some(id) = p.get("id").and_then(|id| id.as_str()) {
            id != period_id
        } else {
            true // Keep periods without an id
        }
    });

    // If no period was removed, return an error
    if periods.len() == initial_len {
        crate::error_log!("Period with id {} not found", period_id);
        return Err(format!("Period with id {} not found", period_id));
    }

    // Save updated periods
    let periods_value = Value::Array(periods.clone());
    crate::commands::options::set_option(db, PERIODS_KEY, periods_value).await?;

    crate::info_log!("remove_period() - done");

    Ok(())
}
