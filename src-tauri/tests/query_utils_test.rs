use serde_json::json;
use jobs_journal::utils::query_utils::{extract_fields};
use uuid::Uuid;

#[test]
fn test_extract_fields_skips_nulls() { 
    let json = json!({
        "id": Uuid::new_v4(),
        "company": "Acme",
        "title": "Engineer",
        "link": null
    });

    let obj = json.as_object().unwrap();
    let (keys, values) = extract_fields(obj);

    // Should include all non-null fields, including 'id'
    assert_eq!(keys, vec!["company","id", "title"]);
    assert_eq!(values.len(), 3);  // three non-null values
}