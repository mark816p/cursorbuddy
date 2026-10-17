// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod accessibility;
pub mod audio;
pub mod coords;
pub mod dictate;
pub mod hotkey;
pub mod jobs;
pub mod mascot;
pub mod overlay;
pub mod screen;
pub mod tray;

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use once_cell::sync::Lazy;
use parking_lot::Mutex;
use tauri::{Emitter, Manager};

static IS_PAUSED: Lazy<Arc<AtomicBool>> = Lazy::new(|| Arc::new(AtomicBool::new(false)));
static AUDIO_RECORDER: Lazy<Arc<Mutex<audio::capture::AudioRecorder>>> =
    Lazy::new(|| Arc::new(Mutex::new(audio::capture::AudioRecorder::new())));
static AUDIO_PLAYER: Lazy<Arc<Mutex<audio::playback::AudioPlayer>>> =
    Lazy::new(|| Arc::new(Mutex::new(audio::playback::AudioPlayer::new())));

#[tauri::command]
fn get_companion_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "paused": IS_PAUSED.load(Ordering::Relaxed),
        "version": env!("CARGO_PKG_VERSION")
    }))
}

#[tauri::command]
fn toggle_pause() -> Result<bool, String> {
    let prev = IS_PAUSED.fetch_xor(true, Ordering::Relaxed);
    Ok(!prev)
}

#[tauri::command]
fn start_mic_capture(app: tauri::AppHandle) -> Result<(), String> {
    let mut recorder = AUDIO_RECORDER.lock();
    let app_handle = app.clone();

    recorder
        .start(move |energy| {
            let _ = app_handle.emit("mic_energy", energy);
        })
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn stop_mic_capture() -> Result<Vec<u8>, String> {
    let mut recorder = AUDIO_RECORDER.lock();
    recorder.stop().map_err(|e| e.to_string())
}

#[tauri::command]
fn capture_screen(custom_blocklist: Vec<String>, debug_mode: bool) -> Result<screen::capture::CaptureResult, String> {
    let filter = screen::redact::RedactionFilter::new(custom_blocklist);
    screen::capture::capture_cursor_display(&filter, debug_mode).map_err(|e| e.to_string())
}

#[tauri::command]
fn play_tts_stream(app: tauri::AppHandle, audio_bytes: Vec<u8>) -> Result<(), String> {
    let mut player = AUDIO_PLAYER.lock();
    let app_handle = app.clone();

    player
        .play_bytes(audio_bytes, move |amplitude| {
            let _ = app_handle.emit("tts_amplitude", amplitude);
        })
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn stop_tts_playback() -> Result<(), String> {
    let mut player = AUDIO_PLAYER.lock();
    player.stop();
    Ok(())
}

fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_companion_status,
            toggle_pause,
            start_mic_capture,
            stop_mic_capture,
            capture_screen,
            play_tts_stream,
            stop_tts_playback,
            dictate::paste_dictated_text,
            accessibility::get_ui_elements,
            jobs::record_file_action,
            jobs::undo_last_file_action,
            jobs::get_journal_history,
            jobs::notify_task_completed,
            overlay::show_overlay,
            overlay::hide_overlay,
            overlay::render_annotations,
            overlay::toggle_calibration_grid,
        ])
        .setup(|app| {
            // Initialize system tray
            let _tray = tray::create_tray(app.handle())?;

            // Initialize global hotkey listener
            let app_handle = app.handle().clone();
            let paused_flag = IS_PAUSED.clone();

            hotkey::start_hotkey_listener(paused_flag, move |action| {
                match action {
                    hotkey::HotkeyAction::KeyDown(mode) => {
                        tracing::info!("Global Hotkey Down: {:?}", mode);
                        let _ = app_handle.emit("hotkey_down", mode);
                    }
                    hotkey::HotkeyAction::KeyUp(mode) => {
                        tracing::info!("Global Hotkey Up: {:?}", mode);
                        let _ = app_handle.emit("hotkey_up", mode);
                    }
                }
            });

            tracing::info!("Cursorbuddy Tauri 2 core and screen capture initialized successfully");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running cursorbuddy application");
}
