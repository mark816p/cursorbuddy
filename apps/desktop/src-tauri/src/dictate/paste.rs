//! Dictation Mode: Clipboard Backup, Simulated Paste & Restoration
//!
//! When dictation mode completes, this module:
//! 1. Backs up the user's current clipboard text via `arboard`.
//! 2. Writes the newly transcribed text to the clipboard.
//! 3. Simulates native paste (Ctrl+V on Windows/Linux, Cmd+V on macOS) via `enigo`.
//! 4. Waits 50ms for target application consumption.
//! 5. Seamlessly restores the previous clipboard contents.

use anyhow::{Context, Result};
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use std::thread::sleep;
use std::time::Duration;

pub struct DictationPaster;

impl DictationPaster {
    /// Paste transcribed text into the currently focused field, preserving clipboard contents.
    pub fn paste_and_restore(text: &str) -> Result<()> {
        let mut clipboard = arboard::Clipboard::new()
            .context("Failed to initialize system clipboard")?;

        // 1. Backup existing clipboard content
        let previous_text = clipboard.get_text().ok();

        // 2. Write transcribed text to clipboard
        clipboard
            .set_text(text)
            .context("Failed to write transcribed text to clipboard")?;

        // 3. Simulate OS paste shortcut
        let mut enigo = Enigo::new(&Settings::default())
            .map_err(|e| anyhow::anyhow!("Failed to initialize Enigo: {:?}", e))?;

        #[cfg(target_os = "macos")]
        {
            let _ = enigo.key(Key::Meta, Direction::Press);
            let _ = enigo.key(Key::Unicode('v'), Direction::Click);
            let _ = enigo.key(Key::Meta, Direction::Release);
        }

        #[cfg(not(target_os = "macos"))]
        {
            let _ = enigo.key(Key::Control, Direction::Press);
            let _ = enigo.key(Key::Unicode('v'), Direction::Click);
            let _ = enigo.key(Key::Control, Direction::Release);
        }

        // 4. Brief delay to ensure target application reads clipboard before restoration
        sleep(Duration::from_millis(50));

        // 5. Restore previous clipboard content
        if let Some(prev) = previous_text {
            let _ = clipboard.set_text(prev);
        }

        tracing::info!("Dictation text pasted successfully and clipboard restored");
        Ok(())
    }
}
