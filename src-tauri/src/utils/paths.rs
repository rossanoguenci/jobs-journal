use tauri::{Manager};

#[cfg(feature = "dev")]
pub fn get_app_data_path() -> String {
    use std::env;

    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Move up one level from `src-tauri/` to `jobs-journal/`
    let project_root = current_dir.parent().expect("Failed to find project root");

    let path = project_root.join("src-tauri-dev-tools");
    path.to_str().unwrap().to_string()
}

#[cfg(not(feature = "dev"))]
pub fn get_app_data_path(app_handle: &tauri::AppHandle) -> String {
    let base_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    base_dir.to_str().unwrap().to_string()
}
