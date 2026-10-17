//! Low-level Global Hotkey Listener via rdev
//!
//! Tracks modifier combinations without stealing input focus:
//! - Push-to-Talk Chord: Ctrl + Alt (Windows) / Cmd + Option (macOS)
//! - Dictation Chord: Ctrl + Alt + Shift (Windows) / Cmd + Option + Shift (macOS)
//! - AltGr Detection: Differentiates Left Alt vs Right Alt on Windows international layouts.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HotkeyMode {
    Ask,
    Dictate,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HotkeyAction {
    KeyDown(HotkeyMode),
    KeyUp(HotkeyMode),
}

#[derive(Debug, Default)]
pub struct ModifierState {
    pub left_ctrl: bool,
    pub right_ctrl: bool,
    pub left_alt: bool,
    pub right_alt: bool,
    pub shift: bool,
    pub meta_cmd: bool,
    pub active_mode: Option<HotkeyMode>,
}

impl ModifierState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn has_ctrl(&self) -> bool {
        self.left_ctrl || self.right_ctrl
    }

    pub fn has_alt(&self) -> bool {
        self.left_alt || self.right_alt
    }

    /// On Windows international keyboards, AltGr emits Ctrl + Right Alt.
    pub fn is_alt_gr_active(&self) -> bool {
        self.has_ctrl() && self.right_alt && !self.left_alt
    }

    /// Evaluates if the push-to-talk or dictation chord is currently held.
    #[cfg(windows)]
    pub fn evaluate_chord(&self) -> Option<HotkeyMode> {
        let ctrl = self.has_ctrl();
        let alt = self.has_alt();

        if ctrl && alt {
            if self.shift {
                Some(HotkeyMode::Dictate)
            } else {
                Some(HotkeyMode::Ask)
            }
        } else {
            None
        }
    }

    #[cfg(not(windows))]
    pub fn evaluate_chord(&self) -> Option<HotkeyMode> {
        let cmd = self.meta_cmd;
        let alt = self.has_alt();

        if cmd && alt {
            if self.shift {
                Some(HotkeyMode::Dictate)
            } else {
                Some(HotkeyMode::Ask)
            }
        } else {
            None
        }
    }

    /// Updates internal state on key event and returns HotkeyAction if a transition occurred.
    pub fn handle_key_event(&mut self, key: rdev::Key, is_down: bool) -> Option<HotkeyAction> {
        match key {
            rdev::Key::ControlLeft => self.left_ctrl = is_down,
            rdev::Key::ControlRight => self.right_ctrl = is_down,
            rdev::Key::Alt => self.left_alt = is_down,
            rdev::Key::AltGr => self.right_alt = is_down,
            rdev::Key::ShiftLeft | rdev::Key::ShiftRight => self.shift = is_down,
            rdev::Key::MetaLeft | rdev::Key::MetaRight => self.meta_cmd = is_down,
            _ => return None,
        }

        let new_chord = self.evaluate_chord();
        let old_mode = self.active_mode;

        match (old_mode, new_chord) {
            (None, Some(mode)) => {
                self.active_mode = Some(mode);
                Some(HotkeyAction::KeyDown(mode))
            }
            (Some(mode), None) => {
                self.active_mode = None;
                Some(HotkeyAction::KeyUp(mode))
            }
            (Some(mode_a), Some(mode_b)) if mode_a != mode_b => {
                // Shift toggled while holding Ctrl+Alt
                self.active_mode = Some(mode_b);
                Some(HotkeyAction::KeyDown(mode_b))
            }
            _ => None,
        }
    }
}

/// Spawns the background rdev hook on a dedicated OS thread.
pub fn start_hotkey_listener<F>(is_paused: Arc<AtomicBool>, callback: F)
where
    F: Fn(HotkeyAction) + Send + Sync + 'static,
{
    std::thread::spawn(move || {
        let mut state = ModifierState::new();

        let event_callback = move |event: rdev::Event| {
            if is_paused.load(Ordering::Relaxed) {
                return;
            }

            let (key, is_down) = match event.event_type {
                rdev::EventType::KeyPress(k) => (k, true),
                rdev::EventType::KeyRelease(k) => (k, false),
                _ => return,
            };

            if let Some(action) = state.handle_key_event(key, is_down) {
                callback(action);
            }
        };

        if let Err(error) = rdev::listen(event_callback) {
            tracing::error!("Failed to initialize rdev global keyboard listener: {:?}", error);
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_push_to_talk_press_and_release_flow() {
        let mut state = ModifierState::new();

        // Press Ctrl
        assert_eq!(state.handle_key_event(rdev::Key::ControlLeft, true), None);
        // Press Alt -> Triggers KeyDown(Ask)
        assert_eq!(
            state.handle_key_event(rdev::Key::Alt, true),
            Some(HotkeyAction::KeyDown(HotkeyMode::Ask))
        );

        // Release Alt -> Triggers KeyUp(Ask)
        assert_eq!(
            state.handle_key_event(rdev::Key::Alt, false),
            Some(HotkeyAction::KeyUp(HotkeyMode::Ask))
        );

        // Release Ctrl
        assert_eq!(state.handle_key_event(rdev::Key::ControlLeft, false), None);
    }

    #[test]
    fn test_dictation_chord_flow() {
        let mut state = ModifierState::new();

        // Hold Shift
        state.handle_key_event(rdev::Key::ShiftLeft, true);
        // Hold Ctrl
        state.handle_key_event(rdev::Key::ControlLeft, true);
        // Press Alt -> Triggers KeyDown(Dictate)
        assert_eq!(
            state.handle_key_event(rdev::Key::Alt, true),
            Some(HotkeyAction::KeyDown(HotkeyMode::Dictate))
        );

        // Release Shift -> Triggers KeyDown(Ask) (mode switch)
        assert_eq!(
            state.handle_key_event(rdev::Key::ShiftLeft, false),
            Some(HotkeyAction::KeyDown(HotkeyMode::Ask))
        );

        // Release Ctrl -> Triggers KeyUp(Ask)
        assert_eq!(
            state.handle_key_event(rdev::Key::ControlLeft, false),
            Some(HotkeyAction::KeyUp(HotkeyMode::Ask))
        );
    }

    #[test]
    fn test_alt_gr_detection() {
        let mut state = ModifierState::new();
        state.left_ctrl = true;
        state.right_alt = true;
        assert!(state.is_alt_gr_active());

        // Left Alt is not AltGr
        state.left_alt = true;
        state.right_alt = false;
        assert!(!state.is_alt_gr_active());
    }
}
