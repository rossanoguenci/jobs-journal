//! Data models representing the results of startup checks.
//!
//! These structs are serialized and sent to the frontend. They are also
//! exported to TypeScript via `ts-rs` for type-safe consumption in the UI.
//! Each startup step computes a rich internal outcome which we condense
//! into a `StepResult` for transport to the UI.

use serde::Serialize;
use ts_rs::TS;

/// The outcome of a single startup step.
#[derive(Debug, Serialize, Clone, TS)]
#[ts(export)]
pub struct StepResult {
    /// A unique key identifying the step (e.g., "ensure_periods").
    pub key: String,
    /// Whether the step resulted in a change to state or data.
    pub changed: bool,
    /// A human-readable message describing what the step did.
    pub message: String,
    /// Whether the frontend must prompt the user to take action before continuing.
    pub requires_action: bool,
}

/// Aggregated results of running all startup steps.
#[derive(Debug, Serialize, Clone, TS)]
#[ts(export)]
pub struct RunResult {
    /// The ordered list of step outcomes.
    pub steps: Vec<StepResult>,
}