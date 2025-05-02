use serde_json::json;
use jobs_journal::utils::query_utils::{extract_fields};

#[test]
fn test_extract_fields_skips_nulls_and_id() {
    let json = json!({
        "id": 1,
        "company": "Acme",
        "title": "Engineer",
        "link": null
    });

    let obj = json.as_object().unwrap();
    let (keys, values) = extract_fields(obj);

    assert_eq!(keys, vec!["company", "title"]);
    assert_eq!(values.len(), 2);
}
