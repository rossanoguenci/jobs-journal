use serde::{Deserialize, Serialize};
use crate::models::job_insert::JobInsert;
use crate::models::job_update::JobUpdate;

// Constrain upsert payload to known structs using an untagged enum
// IMPORTANT: Put Update first so that if an `id` is present, it deserializes as Update.
#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum JobUpsertPayload {
    Update(JobUpdate),
    Insert(JobInsert),
}
