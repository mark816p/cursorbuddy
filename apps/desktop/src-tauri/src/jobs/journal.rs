//! Local File Modification Undo Journal
//!
//! Maintains a transactional journal of all file modifications (renames and moves).
//! Non-negotiable rule: Cursorbuddy NEVER deletes files.
//! Supports instant, reliable one-click undo of file operations.

use anyhow::{anyhow, Result};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct JournalEntry {
    pub id: String,
    pub action_type: String, // "rename", "move", "create"
    pub source_path: String,
    pub destination_path: String,
    pub timestamp: u64,
    pub undone: bool,
}

pub struct FileJournal {
    entries: Arc<Mutex<Vec<JournalEntry>>>,
    journal_file: PathBuf,
}

impl FileJournal {
    pub fn new() -> Self {
        let home_dir = std::env::var("USERPROFILE")
            .or_else(|_| std::env::var("HOME"))
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."));
        let cursorbuddy_dir = home_dir.join(".cursorbuddy");
        let _ = fs::create_dir_all(&cursorbuddy_dir);
        let journal_file = cursorbuddy_dir.join("journal.json");

        let mut entries = Vec::new();
        if journal_file.exists() {
            if let Ok(data) = fs::read_to_string(&journal_file) {
                if let Ok(loaded) = serde_json::from_str::<Vec<JournalEntry>>(&data) {
                    entries = loaded;
                }
            }
        }

        Self {
            entries: Arc::new(Mutex::new(entries)),
            journal_file,
        }
    }

    /// Record a file rename or move action.
    pub fn record_action(
        &self,
        action_type: &str,
        source_path: &str,
        destination_path: &str,
    ) -> Result<JournalEntry> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default();
        let timestamp_secs = now.as_secs();
        let nanos = now.subsec_nanos();

        let entry = JournalEntry {
            id: format!("act_{}_{}", timestamp_secs, nanos),
            action_type: action_type.to_string(),
            source_path: source_path.to_string(),
            destination_path: destination_path.to_string(),
            timestamp: timestamp_secs,
            undone: false,
        };

        let mut lock = self.entries.lock();
        lock.push(entry.clone());
        self.persist(&lock);

        tracing::info!("Journaled file action {}: {} -> {}", action_type, source_path, destination_path);
        Ok(entry)
    }

    /// Undo the most recent active file action (reversing rename or move).
    pub fn undo_last(&self) -> Result<JournalEntry> {
        let mut lock = self.entries.lock();
        let last_active_idx = lock
            .iter()
            .rposition(|e| !e.undone)
            .ok_or_else(|| anyhow!("No actions available to undo in journal"))?;

        let entry = &mut lock[last_active_idx];

        // Safety check: verify target file exists before reversing
        let dest = Path::new(&entry.destination_path);
        if !dest.exists() {
            return Err(anyhow!("Target file {} does not exist on disk", entry.destination_path));
        }

        // Reverse the rename/move operation
        fs::rename(&entry.destination_path, &entry.source_path)
            .map_err(|e| anyhow!("Failed to restore file to {}: {}", entry.source_path, e))?;

        entry.undone = true;
        let undone_entry = entry.clone();
        self.persist(&lock);

        tracing::info!("Successfully undone action: restored {} back to {}", undone_entry.destination_path, undone_entry.source_path);
        Ok(undone_entry)
    }

    /// Retrieve full journal history.
    pub fn get_history(&self) -> Vec<JournalEntry> {
        self.entries.lock().clone()
    }

    fn persist(&self, entries: &[JournalEntry]) {
        if let Ok(serialized) = serde_json::to_string_pretty(entries) {
            let _ = fs::write(&self.journal_file, serialized);
        }
    }
}

impl Default for FileJournal {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_record_and_undo_action() {
        let temp_dir = std::env::temp_dir();
        let src_file = temp_dir.join("cursorbuddy_test_src.txt");
        let dst_file = temp_dir.join("cursorbuddy_test_dst.txt");

        // Setup test file
        let _ = fs::write(&src_file, "Hello Cursorbuddy Undo");

        let journal = FileJournal::new();

        // Perform move on disk
        let _ = fs::rename(&src_file, &dst_file);

        // Record in journal
        let entry = journal
            .record_action(
                "rename",
                src_file.to_str().unwrap(),
                dst_file.to_str().unwrap(),
            )
            .expect("record failed");

        assert_eq!(entry.undone, false);
        assert!(dst_file.exists());
        assert!(!src_file.exists());

        // Undo action
        let undone = journal.undo_last().expect("undo failed");
        assert_eq!(undone.undone, true);
        assert!(src_file.exists());
        assert!(!dst_file.exists());

        // Cleanup
        let _ = fs::remove_file(src_file);
    }
}
