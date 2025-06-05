use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use once_cell::sync::OnceCell;

static APP_HANDLE: OnceCell<AppHandle> = OnceCell::new();

pub fn set_app_handle(handle: AppHandle) {
    APP_HANDLE.set(handle).ok(); // ignore error if already set
}

pub fn get_app_data_path() -> String {
    #[cfg(feature = "dev")]
    {
        use std::env;

        let current_dir = env::current_dir().expect("Failed to get current directory");
        let project_root = current_dir.parent().expect("Failed to find project root");
        return project_root
            .join("src-tauri-dev-tools")
            .to_str()
            .unwrap()
            .to_string();
    }

    #[cfg(not(feature = "dev"))]
    {
        let app_handle = APP_HANDLE.get().expect("AppHandle not set");
        let base_dir = app_handle
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory");

        base_dir.to_str().unwrap().to_string()
    }
}
