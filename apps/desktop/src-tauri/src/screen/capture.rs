//! Screen Capture Engine via xcap
//!
//! Identifies the display currently hosting the cursor, captures only that display,
//! applies the local redaction pipeline, and downscales the frame in memory.

use std::fs;
use anyhow::{anyhow, Result};
use image::RgbaImage;
use serde::{Deserialize, Serialize};

use crate::coords::DisplayGeometry;
use crate::screen::redact::{apply_redactions, RedactionFilter, WindowMeta};
use crate::screen::rescale::downscale_and_encode_jpeg;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureResult {
    #[serde(skip)]
    pub jpeg_bytes: Vec<u8>,
    pub resize_factor: f64,
    pub display_geom: DisplayGeometry,
    pub redacted_count: usize,
    pub debug_path: Option<String>,
}

/// Query current system cursor location in global virtual desktop physical coordinates.
#[cfg(windows)]
pub fn get_cursor_position() -> (i32, i32) {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

    unsafe {
        let mut pt = POINT { x: 0, y: 0 };
        if GetCursorPos(&mut pt).is_ok() {
            (pt.x, pt.y)
        } else {
            (0, 0)
        }
    }
}

#[cfg(not(windows))]
pub fn get_cursor_position() -> (i32, i32) {
    // macOS / Linux fallback
    (0, 0)
}

/// Identifies the monitor containing (cursor_x, cursor_y) from a list of xcap monitors.
pub fn find_monitor_under_cursor(
    monitors: Vec<xcap::Monitor>,
    cursor_x: i32,
    cursor_y: i32,
) -> Option<xcap::Monitor> {
    for mon in monitors.iter() {
        let mx = mon.x();
        let my = mon.y();
        let mw = mon.width() as i32;
        let mh = mon.height() as i32;

        if cursor_x >= mx && cursor_x < mx + mw && cursor_y >= my && cursor_y < my + mh {
            return Some(mon.clone());
        }
    }

    // Fall back to primary monitor or first available
    monitors
        .iter()
        .find(|m| m.is_primary())
        .cloned()
        .or_else(|| monitors.first().cloned())
}

/// Captures the target monitor, redacts sensitive windows, and downscales in memory.
pub fn capture_cursor_display(
    filter: &RedactionFilter,
    is_debug_mode: bool,
) -> Result<CaptureResult> {
    let (cursor_x, cursor_y) = get_cursor_position();

    let all_monitors = xcap::Monitor::all()
        .map_err(|e| anyhow!("Failed to enumerate displays via xcap: {}", e))?;

    if all_monitors.is_empty() {
        return Err(anyhow!("No monitors found on host system"));
    }

    let target_mon = find_monitor_under_cursor(all_monitors, cursor_x, cursor_y)
        .ok_or_else(|| anyhow!("Unable to select a target display"))?;

    let mon_x = target_mon.x();
    let mon_y = target_mon.y();
    let mon_w = target_mon.width();
    let mon_h = target_mon.height();
    let mon_scale = target_mon.scale_factor() as f64;

    // 1. Capture raw display frame
    let captured_frame = target_mon
        .capture_image()
        .map_err(|e| anyhow!("Screen capture failed: {}", e))?;

    let mut rgba_image: RgbaImage = captured_frame;

    // 2. Enumerate visible windows for redaction
    let mut window_metas = Vec::new();
    if let Ok(windows) = xcap::Window::all() {
        for win in windows {
            if win.is_minimized() {
                continue;
            }
            window_metas.push(WindowMeta {
                title: win.title().unwrap_or_default(),
                app_name: win.app_name().unwrap_or_default(),
                x: win.x(),
                y: win.y(),
                width: win.width(),
                height: win.height(),
            });
        }
    }

    // 3. Black out sensitive windows
    let redacted_count = apply_redactions(&mut rgba_image, mon_x, mon_y, &window_metas, filter);

    // 4. Downscale and encode to JPEG in memory
    let (jpeg_bytes, resize_factor) = downscale_and_encode_jpeg(&rgba_image)?;

    // 5. Optional debug mode persistence
    let mut debug_path = None;
    if is_debug_mode {
        let temp_dir = std::env::temp_dir();
        let target_file = temp_dir.join("cursorbuddy_debug_capture.jpg");
        if fs::write(&target_file, &jpeg_bytes).is_ok() {
            debug_path = Some(target_file.to_string_lossy().to_string());
            tracing::info!("Saved debug capture to {:?}", target_file);
        }
    }

    let display_geom = DisplayGeometry {
        scale_factor: mon_scale,
        resize_factor,
        physical_width: mon_w,
        physical_height: mon_h,
        origin_x: mon_x,
        origin_y: mon_y,
    };

    Ok(CaptureResult {
        jpeg_bytes,
        resize_factor,
        display_geom,
        redacted_count,
        debug_path,
    })
}
