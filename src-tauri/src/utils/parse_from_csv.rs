use crate::models::export::JobWithEvents;
use crate::models::{job_entry::JobEntry, job_entry_meta::JobEntryMeta, job_event::JobEvent};
use chrono::{Datelike, Local, NaiveDate, Timelike};
use serde::Deserialize;
use serde_json::json;
use std::fs::File;
use std::io::BufReader;
use uuid::Uuid;
use crate::models::job_event_meta::JobEventMeta;

#[derive(Debug, Deserialize)]
struct CsvRow {
    company: String,
    title: String,
    date_of_application: String,
    link: Option<String>,
    location: Option<String>,
    notes: Option<String>,
    status: String,
    events: Option<String>,
}

fn parse_date(raw: &str) -> Option<String> {
    NaiveDate::parse_from_str(raw.trim(), "%d/%m/%Y")
        .ok()
        .map(|d| d.format("%Y-%m-%d").to_string())
}

fn find_value<'a>(term: &'a str, data: &'a [(&str, &'a str)]) -> &'a str {
    for (key, value) in data {
        if *key == term {
            return *value;
        }
    }
    term
}

pub fn parse_events(events_str: &str, job_id: &str) -> Vec<JobEvent> {
    let now = Local::now();
    let date_of_event = now.format("%Y-%m-%d").to_string();
    let insert_date = now.format("%Y-%m-%d %H:%M:%S").to_string();

    events_str
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| JobEvent {
            id: Some(Uuid::new_v4().to_string()),
            job_id: job_id.to_string(),
            date_of_event: date_of_event.clone(),
            description: line.trim().to_string(),
            insert_type: Some("automatic".into()),
            insert_date: Some(insert_date.clone()),
            meta: Some(JobEventMeta {
                type_of_import: Some("csv".into()),
            }),

        })
        .collect()
}

pub fn load_jobs_from_csv(path: &str) -> Result<Vec<JobWithEvents>, String> {
    crate::debug_log!("load_jobs_from_csv() invoked");

    let file = File::open(path).map_err(|e| e.to_string())?;
    let mut rdr = csv::Reader::from_reader(BufReader::new(file));

    let mut result = Vec::new();

    let status_map = [("application_sent", "sent"), ("disappeared", "ghosted")];

    for record in rdr.deserialize() {
        let row: CsvRow = record.map_err(|e| e.to_string())?;
        let id = Uuid::new_v4().to_string();
        let status_value = row.status.to_lowercase().replace(" ", "_");

        // Create meta JSON object
        let meta_json = json!({
            "note": row.notes.unwrap_or_default(),
            "location": row.location.unwrap_or_default(),
            "link_to_job_posting": row.link.unwrap_or_default()
        });

        let meta_struct: JobEntryMeta =
            serde_json::from_value(meta_json).map_err(|e| e.to_string())?;

        let job = JobEntry {
            id: id.clone(),
            insert_date: chrono::Local::now().to_string(),
            company: row.company,
            title: row.title,
            application_date: parse_date(&row.date_of_application).unwrap_or_default(),
            status: find_value(&status_value, &status_map).parse().unwrap(),
            insert_status: "inserted".to_string(),
            meta: meta_struct,
        };

        let events = row
            .events
            .as_deref()
            .map(|e| parse_events(e, &id))
            .unwrap_or_default();

        crate::debug_log!("Job loaded: {:?}", job);
        crate::debug_log!("Events loaded: {:?}", events);

        result.push(JobWithEvents { job, events });
    }

    Ok(result)
}
