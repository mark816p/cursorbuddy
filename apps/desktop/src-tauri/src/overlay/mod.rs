//! Overlay Module: Click-Through Window Management, Coordinate Conversion, & Window Persistence

pub mod manager;
pub mod persistence;

use tauri::{command, AppHandle, Emitter, Manager};
use crate::coords::DisplayGeometry;
pub use manager::{ConvertedAnnotationCss, OverlayManager, RawAnnotationItem};
pub use persistence::{ActiveWindowInfo, ActiveWindowTracker, WindowRect};

#[command]
pub fn show_overlay(app: AppHandle) -> Result<(), String> {
    if let Some(overlay_win) = app.get_webview_window("overlay") {
        OverlayManager::configure_overlay_window(&overlay_win).map_err(|e| e.to_string())?;
        overlay_win.show().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    OverlayManager::clear_annotations(&app).map_err(|e| e.to_string())
}

#[command]
pub fn render_annotations(
    app: AppHandle,
    annotations: Vec<RawAnnotationItem>,
    geometry: DisplayGeometry,
) -> Result<(), String> {
    OverlayManager::render_annotations(&app, &annotations, &geometry).map_err(|e| e.to_string())
}

#[command]
pub fn toggle_calibration_grid(app: AppHandle, enabled: bool) -> Result<(), String> {
    if let Some(overlay_win) = app.get_webview_window("overlay") {
        OverlayManager::configure_overlay_window(&overlay_win).map_err(|e| e.to_string())?;
        if enabled {
            overlay_win.show().map_err(|e| e.to_string())?;
        }
        overlay_win.emit("toggle_calibration_grid", enabled).map_err(|e| e.to_string())?;
    }
    Ok(())
}
