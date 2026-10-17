//! Windows UIAutomation Accessibility Grounding
//!
//! Enumerates interactive UI elements (Buttons, MenuItems, Tabs, Edits, Links)
//! within the currently focused window using Microsoft UIAutomation.

use crate::coords::RectBounds;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiElement {
    pub id: String,
    pub role: String,
    pub name: String,
    pub bounds: RectBounds,
}

#[cfg(windows)]
pub fn query_focused_window_uia_elements() -> Vec<UiElement> {
    use uiautomation::core::UIAutomation;
    use uiautomation::types::UIProperty;

    let mut results = Vec::new();

    let automation = match UIAutomation::new() {
        Ok(a) => a,
        Err(e) => {
            tracing::warn!("Failed to initialize UIAutomation COM: {}", e);
            return results;
        }
    };

    let focused = match automation.get_focused_element() {
        Ok(el) => el,
        Err(_) => return results,
    };

    // Find the top-level parent window or container of the focused element
    let matcher = automation
        .create_matcher()
        .from(focused)
        .max_depth(3)
        .timeout(200);

    // Enumerate interactive child controls
    if let Ok(elements) = matcher.find_all() {
        for (idx, el) in elements.into_iter().enumerate() {
            if results.len() >= 30 {
                break;
            }

            let name = el.get_name().unwrap_or_default();
            let role = el
                .get_property_value(UIProperty::LocalizedControlType)
                .and_then(|v| v.get_string())
                .unwrap_or_else(|_| "Control".to_string());

            let auto_id = el
                .get_property_value(UIProperty::AutomationId)
                .and_then(|v| v.get_string())
                .unwrap_or_else(|_| format!("elem_{}", idx));

            if let Ok(rect) = el.get_bounding_rectangle() {
                let w = (rect.get_right() - rect.get_left()).max(0) as u32;
                let h = (rect.get_bottom() - rect.get_top()).max(0) as u32;

                if w > 4 && h > 4 && (!name.is_empty() || !auto_id.is_empty()) {
                    results.push(UiElement {
                        id: auto_id,
                        role,
                        name,
                        bounds: RectBounds {
                            x: rect.get_left(),
                            y: rect.get_top(),
                            w,
                            h,
                        },
                    });
                }
            }
        }
    }

    results
}

#[cfg(not(windows))]
pub fn query_focused_window_uia_elements() -> Vec<UiElement> {
    Vec::new()
}
