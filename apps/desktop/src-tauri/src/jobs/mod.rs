//! Jobs and File Modification Journal Module

pub mod journal;

use once_cell::sync::Lazy;
use std::sync::Arc;
use tauri::{command, AppHandle};
use tauri_plugin_notification::NotificationExt;

pub use journal::{FileJournal, JournalEntry};

static FILE_JOURNAL: Lazy<Arc<FileJournal>> = Lazy::new(|| Arc::new(FileJournal::new()));

#[command]
pub fn record_file_action(
    action_type: String,
    source_path: String,
    destination_path: String,
) -> Result<JournalEntry, String> {
    FILE_JOURNAL
        .record_action(&action_type, &source_path, &destination_path)
        .map_err(|e| e.to_string())
}

#[command]
pub fn undo_last_file_action() -> Result<JournalEntry, String> {
    FILE_JOURNAL.undo_last().map_err(|e| e.to_string())
}

#[command]
pub fn get_journal_history() -> Result<Vec<JournalEntry>, String> {
    Ok(FILE_JOURNAL.get_history())
}

#[command]
pub fn notify_task_completed(app: AppHandle, title: String, message: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(message)
        .show()
        .map_err(|e| e.to_string())
}
