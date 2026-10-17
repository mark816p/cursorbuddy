//! Accessibility Grounding Module (Windows UIA & macOS AX)

pub mod macos_ax;
pub mod windows_uia;

pub use windows_uia::UiElement;
use crate::coords::RectBounds;
use tauri::command;

#[command]
pub fn get_ui_elements() -> Result<Vec<UiElement>, String> {
    #[cfg(windows)]
    {
        Ok(windows_uia::query_focused_window_uia_elements())
    }
    #[cfg(target_os = "macos")]
    {
        Ok(macos_ax::query_focused_window_ax_elements())
    }
    #[cfg(not(any(windows, target_os = "macos")))]
    {
        Ok(Vec::new())
    }
}

/// Snapping helper: snap bounding coordinates to an accessibility element if matching ID is found.
pub fn snap_bounds_to_element(
    orig_x: i32,
    orig_y: i32,
    orig_w: u32,
    orig_h: u32,
    element_id: Option<&str>,
    elements: &[UiElement],
) -> RectBounds {
    if let Some(target_id) = element_id {
        if let Some(matched) = elements.iter().find(|el| el.id == target_id) {
            return matched.bounds;
        }
    }

    RectBounds {
        x: orig_x,
        y: orig_y,
        w: orig_w,
        h: orig_h,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snap_bounds_to_matching_element() {
        let elements = vec![
            UiElement {
                id: "btn_save".to_string(),
                role: "Button".to_string(),
                name: "Save".to_string(),
                bounds: RectBounds { x: 250, y: 150, w: 80, h: 32 },
            },
            UiElement {
                id: "btn_cancel".to_string(),
                role: "Button".to_string(),
                name: "Cancel".to_string(),
                bounds: RectBounds { x: 340, y: 150, w: 80, h: 32 },
            },
        ];

        let snapped = snap_bounds_to_element(248, 149, 85, 35, Some("btn_save"), &elements);
        assert_eq!(snapped.x, 250);
        assert_eq!(snapped.y, 150);
        assert_eq!(snapped.w, 80);
        assert_eq!(snapped.h, 32);

        // Fallback when ID doesn't match
        let unsnapped = snap_bounds_to_element(10, 10, 50, 50, Some("btn_unknown"), &elements);
        assert_eq!(unsnapped.x, 10);
        assert_eq!(unsnapped.w, 50);
    }
}
