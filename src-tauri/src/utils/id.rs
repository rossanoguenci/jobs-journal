use uuid::Uuid;

/// Generates a new UUID as a string.
pub fn generate_id() -> String {
    Uuid::new_v4().to_string()
}
