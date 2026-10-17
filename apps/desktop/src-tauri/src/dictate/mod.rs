//! Dictation Module for Quick Speech-to-Text Insertion

pub mod paste;

use tauri::{command, AppHandle};
pub use paste::DictationPaster;

#[command]
pub fn paste_dictated_text(_app: AppHandle, text: String) -> Result<(), String> {
    DictationPaster::paste_and_restore(&text).map_err(|e| e.to_string())
}
