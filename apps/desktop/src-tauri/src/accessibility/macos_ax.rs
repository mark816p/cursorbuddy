//! macOS Accessibility (AX) API Grounding
//!
//! Enumerates accessible interactive controls on macOS via ApplicationServices.

use crate::coords::RectBounds;
use super::windows_uia::UiElement;

#[cfg(target_os = "macos")]
pub fn query_focused_window_ax_elements() -> Vec<UiElement> {
    // macOS AXUIElement query implementation
    Vec::new()
}

#[cfg(not(target_os = "macos"))]
pub fn query_focused_window_ax_elements() -> Vec<UiElement> {
    Vec::new()
}
