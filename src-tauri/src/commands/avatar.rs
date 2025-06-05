use crate::utils::paths::get_app_data_path;
use base64::Engine;
use base64::engine::general_purpose::STANDARD as base64_engine;
use std::fs;
use std::path::PathBuf;

use image::ImageReader;
use image::codecs::png::PngEncoder;
use image::imageops::FilterType;
use image::{GenericImageView, ImageEncoder, ExtendedColorType};
use std::io::Cursor;

#[tauri::command]
pub async fn avatar_exists() -> bool {
    let base_path = get_app_data_path();
    let avatar_path: PathBuf = [base_path.as_str(), "avatar.png"].iter().collect();

    let exists = fs::metadata(avatar_path).is_ok();

    crate::debug_log!("Will check the avatar at path: {:?}", base_path);
    crate::debug_log!("Avatar exists: {}", exists);

    exists
}

#[tauri::command]
pub async fn save_avatar(base64_png: String) -> Result<(), String> {
    let base_path = get_app_data_path();
    let avatar_path: PathBuf = [base_path.as_str(), "avatar.png"].iter().collect();

    crate::debug_log!("Will save the avatar in: {:?}", avatar_path);

    // Decode base64 PNG (strip prefix if present)
    let base64_cleaned = base64_png
        .split(',')
        .last()
        .ok_or("Invalid base64 image data")?;

    let image_data = base64_engine
        .decode(base64_cleaned)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    // Load image
    let img = ImageReader::new(Cursor::new(&image_data))
        .with_guessed_format()
        .map_err(|e| format!("Failed to detect image format: {}", e))?
        .decode()
        .map_err(|e| format!("Failed to decode image: {}", e))?;

    // Resize keeping aspect ratio to 200px wide
    let resized = img.resize(200, u32::MAX, FilterType::Lanczos3);

    // Prepare output buffer and encode PNG
    let mut buffer = Vec::new();
    let (width, height) = resized.dimensions();
    let encoder = PngEncoder::new(&mut buffer);

    // Convert to RGBA8 to match encoder requirements
    let rgba = resized.to_rgba8();
    encoder
        .write_image(
            &rgba,
            width,
            height,
            ExtendedColorType::Rgba8,
        )
        .map_err(|e| format!("Failed to encode image: {}", e))?;

    // Ensure folder exists
    if let Some(parent) = avatar_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }

    // Write to disk
    fs::write(&avatar_path, buffer)
        .map_err(|e| format!("Failed to write avatar file: {}", e))?;

    Ok(())
}


#[tauri::command]
pub async fn load_avatar() -> Result<Option<String>, String> {
    let base_path = get_app_data_path();
    let avatar_path: PathBuf = [base_path.as_str(), "avatar.png"].iter().collect();

    crate::debug_log!("Will load the avatar from: {:?}", base_path);

    if !avatar_path.exists() {
        return Ok(None);
    }

    let bytes = fs::read(&avatar_path).map_err(|e| format!("Failed to read avatar file: {}", e))?;

    let base64_encoded = base64_engine.encode(&bytes);
    let data_url = format!("data:image/png;base64,{}", base64_encoded);

    Ok(Some(data_url))
}

#[tauri::command]
pub async fn delete_avatar() -> Result<(), String> {
    let base_path = get_app_data_path();
    let avatar_path: PathBuf = [base_path.as_str(), "avatar.png"].iter().collect();

    crate::debug_log!("Will try to delete the avatar at: {:?}", avatar_path);

    if avatar_path.exists() {
        fs::remove_file(&avatar_path)
            .map_err(|e| format!("Failed to delete avatar file: {}", e))?;
        crate::debug_log!("Avatar deleted successfully.");
    } else {
        crate::debug_log!("Avatar file does not exist, nothing to delete.");
    }

    Ok(())
}