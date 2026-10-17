// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod coords;
pub mod tray;

use tauri::Manager;

#[tauri::command]
fn get_companion_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "paused": tray::is_companion_paused(),
        "version": env!("CARGO_PKG_VERSION")
    }))
}

#[tauri::command]
fn toggle_pause() -> Result<bool, String> {
    Ok(tray::toggle_companion_pause())
}

fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_companion_status,
            toggle_pause,
        ])
        .setup(|app| {
            // Initialize system tray
            let _tray = tray::create_tray(app.handle())?;

            tracing::info!("Cursorbuddy Tauri 2 core initialized successfully");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running cursorbuddy application");
}
