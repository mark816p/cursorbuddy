//! Overlay Window Manager & Anti-Capture Protection
//!
//! Manages transparent click-through overlay windows across connected monitors.
//! Enforces click-through (`set_ignore_cursor_events(true)`) and anti-capture
//! protection (`set_content_protected(true)`) so annotations never recurse in captures.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};

use crate::coords::{model_to_overlay_css_px, DisplayGeometry};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawAnnotationItem {
    pub step: u8,
    #[serde(rename = "type")]
    pub annotation_type: String,
    pub x: i32,
    pub y: i32,
    pub w: u32,
    pub h: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_x: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_y: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to_x: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to_y: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConvertedAnnotationCss {
    pub step: u8,
    #[serde(rename = "type")]
    pub annotation_type: String,
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_x: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub from_y: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to_x: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub to_y: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element_id: Option<String>,
}

pub struct OverlayManager;

impl OverlayManager {
    /// Configure window for click-through and screen capture exclusion.
    pub fn configure_overlay_window(window: &WebviewWindow) -> Result<()> {
        // 1. Enable transparent click-through so user clicks pass to underlying desktop apps
        window.set_ignore_cursor_events(true)?;

        // 2. Anti-capture protection:
        //    Windows: SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)
        //    macOS: NSWindow.sharingType = NSWindowSharingNone
        // Guarantees overlay annotations NEVER appear in xcap screenshots or recordings
        window.set_content_protected(true)?;

        tracing::info!("Overlay window configured: click-through and anti-capture enabled");
        Ok(())
    }

    /// Convert model coordinates to overlay webview CSS pixels and emit to overlay window.
    pub fn render_annotations(
        app: &AppHandle,
        raw_items: &[RawAnnotationItem],
        geometry: &DisplayGeometry,
    ) -> Result<()> {
        let converted: Vec<ConvertedAnnotationCss> = raw_items
            .iter()
            .map(|item| {
                let x = model_to_overlay_css_px(item.x as f64, geometry.resize_factor, geometry.scale_factor);
                let y = model_to_overlay_css_px(item.y as f64, geometry.resize_factor, geometry.scale_factor);
                let w = model_to_overlay_css_px(item.w as f64, geometry.resize_factor, geometry.scale_factor);
                let h = model_to_overlay_css_px(item.h as f64, geometry.resize_factor, geometry.scale_factor);

                let from_x = item.from_x.map(|v| {
                    model_to_overlay_css_px(v as f64, geometry.resize_factor, geometry.scale_factor)
                });
                let from_y = item.from_y.map(|v| {
                    model_to_overlay_css_px(v as f64, geometry.resize_factor, geometry.scale_factor)
                });
                let to_x = item.to_x.map(|v| {
                    model_to_overlay_css_px(v as f64, geometry.resize_factor, geometry.scale_factor)
                });
                let to_y = item.to_y.map(|v| {
                    model_to_overlay_css_px(v as f64, geometry.resize_factor, geometry.scale_factor)
                });

                ConvertedAnnotationCss {
                    step: item.step,
                    annotation_type: item.annotation_type.clone(),
                    x,
                    y,
                    w,
                    h,
                    from_x,
                    from_y,
                    to_x,
                    to_y,
                    label: item.label.clone(),
                    element_id: item.element_id.clone(),
                }
            })
            .collect();

        if let Some(overlay_win) = app.get_webview_window("overlay") {
            let _ = Self::configure_overlay_window(&overlay_win);
            overlay_win.show()?;
            overlay_win.emit("render_annotations", &converted)?;
        }

        Ok(())
    }

    /// Clear all annotations and hide overlay.
    pub fn clear_annotations(app: &AppHandle) -> Result<()> {
        if let Some(overlay_win) = app.get_webview_window("overlay") {
            overlay_win.emit("clear_annotations", ())?;
            overlay_win.hide()?;
        }
        Ok(())
    }
}
