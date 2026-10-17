//! Active Window Persistence & Foreground Tracking (4 Hz)
//!
//! Polls the operating system foreground window at ~4 Hz (every 250ms).
//! If the user switches away from the window where the question was asked,
//! annotations are hidden. If the user returns, annotations are restored,
//! with coordinates dynamically re-mapped if the window moved.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WindowRect {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ActiveWindowInfo {
    pub title: String,
    pub rect: WindowRect,
    pub handle_id: usize,
}

#[derive(Debug, Clone, Default)]
pub struct TrackingState {
    pub target_window: Option<ActiveWindowInfo>,
    pub current_offset: (i32, i32),
    pub is_hidden_due_to_unfocus: bool,
}

pub struct ActiveWindowTracker {
    state: Arc<Mutex<TrackingState>>,
    is_running: Arc<AtomicBool>,
}

impl ActiveWindowTracker {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(TrackingState::default())),
            is_running: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Set the target window that annotations are anchored to.
    pub fn set_target_window(&self, info: ActiveWindowInfo) {
        let mut state = self.state.lock();
        state.target_window = Some(info);
        state.current_offset = (0, 0);
        state.is_hidden_due_to_unfocus = false;
    }

    /// Clear the tracking target (e.g., when annotations are dismissed).
    pub fn clear_target(&self) {
        let mut state = self.state.lock();
        state.target_window = None;
        state.current_offset = (0, 0);
        state.is_hidden_due_to_unfocus = false;
    }

    /// Start 4 Hz foreground window polling loop.
    pub fn start<F>(&self, on_change: F)
    where
        F: Fn(bool, (i32, i32)) + Send + 'static,
    {
        if self.is_running.swap(true, Ordering::SeqCst) {
            return; // Already running
        }

        let state_clone = self.state.clone();
        let running_clone = self.is_running.clone();

        std::thread::spawn(move || {
            while running_clone.load(Ordering::Relaxed) {
                std::thread::sleep(Duration::from_millis(250)); // 4 Hz polling

                let current = get_current_foreground_window();
                let mut state = state_clone.lock();

                if let Some(ref target) = state.target_window {
                    if let Some(ref curr) = current {
                        if curr.handle_id == target.handle_id || curr.title == target.title {
                            // Target window is in foreground
                            let dx = curr.rect.x - target.rect.x;
                            let dy = curr.rect.y - target.rect.y;

                            if state.is_hidden_due_to_unfocus || state.current_offset != (dx, dy) {
                                state.is_hidden_due_to_unfocus = false;
                                state.current_offset = (dx, dy);
                                on_change(true, (dx, dy));
                            }
                        } else {
                            // Different window is foreground; hide annotations
                            if !state.is_hidden_due_to_unfocus {
                                state.is_hidden_due_to_unfocus = true;
                                on_change(false, state.current_offset);
                            }
                        }
                    }
                }
            }
        });
    }

    pub fn stop(&self) {
        self.is_running.store(false, Ordering::SeqCst);
    }
}

/// Query the active OS foreground window across platforms.
#[cfg(windows)]
pub fn get_current_foreground_window() -> Option<ActiveWindowInfo> {
    use windows::Win32::Foundation::{HWND, RECT};
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowRect, GetWindowTextW};

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.0 == 0 as _ {
            return None;
        }

        let mut rect = RECT::default();
        if GetWindowRect(hwnd, &mut rect).is_err() {
            return None;
        }

        let mut title_buf = [0u16; 512];
        let len = GetWindowTextW(hwnd, &mut title_buf);
        let title = String::from_utf16_lossy(&title_buf[..len as usize]);

        Some(ActiveWindowInfo {
            title,
            rect: WindowRect {
                x: rect.left,
                y: rect.top,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top,
            },
            handle_id: hwnd.0 as usize,
        })
    }
}

#[cfg(not(windows))]
pub fn get_current_foreground_window() -> Option<ActiveWindowInfo> {
    // macOS / Linux fallback
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tracking_state_offset_calculation() {
        let tracker = ActiveWindowTracker::new();
        let target = ActiveWindowInfo {
            title: "VS Code".to_string(),
            rect: WindowRect { x: 100, y: 100, width: 800, height: 600 },
            handle_id: 12345,
        };

        tracker.set_target_window(target);
        let state = tracker.state.lock();
        assert_eq!(state.current_offset, (0, 0));
        assert_eq!(state.is_hidden_due_to_unfocus, false);
    }
}
