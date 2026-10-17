//! Coordinate Conversion Engine for Cursorbuddy
//!
//! Transforms coordinates through the pipeline:
//! Model (resized image px) -> / resize_factor -> Physical display px -> / scale_factor -> Webview CSS px.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct RectBounds {
    pub x: i32,
    pub y: i32,
    pub w: u32,
    pub h: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayGeometry {
    pub scale_factor: f64,
    pub resize_factor: f64,
    pub physical_width: u32,
    pub physical_height: u32,
    pub origin_x: i32,
    pub origin_y: i32,
}

/// Calculate image resize factor when constraining the max long edge to 1568px.
pub fn calculate_resize_factor(physical_width: u32, physical_height: u32) -> f64 {
    let max_edge = physical_width.max(physical_height);
    if max_edge > 1568 {
        1568.0 / (max_edge as f64)
    } else {
        1.0
    }
}

/// Convert a model coordinate (in resized image pixels) to monitor-local physical pixels.
pub fn model_to_physical_px(model_coord: f64, resize_factor: f64) -> f64 {
    assert!(resize_factor > 0.0, "resize_factor must be positive");
    model_coord / resize_factor
}

/// Convert monitor-local physical pixels to overlay webview CSS pixels.
pub fn physical_to_css_px(physical_px: f64, scale_factor: f64) -> f64 {
    assert!(scale_factor > 0.0, "scale_factor must be positive");
    physical_px / scale_factor
}

/// Direct conversion from model pixel coordinate to monitor-local webview CSS pixels.
pub fn model_to_overlay_css_px(model_coord: f64, resize_factor: f64, scale_factor: f64) -> f64 {
    let phys = model_to_physical_px(model_coord, resize_factor);
    physical_to_css_px(phys, scale_factor)
}

/// Convert monitor-local physical pixels to global virtual desktop physical pixels.
pub fn physical_to_global_physical_px(local_physical_px: i32, origin_px: i32) -> i32 {
    origin_px + local_physical_px
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WindowRelativeBounds {
    pub rel_x: i32,
    pub rel_y: i32,
    pub w: u32,
    pub h: u32,
}

/// Compute relative offset of an annotation inside a window.
pub fn compute_window_relative_offset(
    ann_x: i32,
    ann_y: i32,
    ann_w: u32,
    ann_h: u32,
    win_x: i32,
    win_y: i32,
) -> WindowRelativeBounds {
    WindowRelativeBounds {
        rel_x: ann_x - win_x,
        rel_y: ann_y - win_y,
        w: ann_w,
        h: ann_h,
    }
}

/// Re-map relative offset when target window moves.
pub fn remap_relative_to_window(
    rel: &WindowRelativeBounds,
    new_win_x: i32,
    new_win_y: i32,
) -> (i32, i32, u32, u32) {
    (
        new_win_x + rel.rel_x,
        new_win_y + rel.rel_y,
        rel.w,
        rel.h,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scenario_1_100_percent_windows_scaling() {
        let width = 1920;
        let height = 1080;
        let resize_factor = calculate_resize_factor(width, height);
        let expected_factor = 1568.0 / 1920.0;
        assert!((resize_factor - expected_factor).abs() < 1e-5);

        let model_x = 784.0;
        let phys_x = model_to_physical_px(model_x, resize_factor);
        assert!((phys_x - 960.0).abs() < 1.0);

        let css_x = model_to_overlay_css_px(model_x, resize_factor, 1.0);
        assert!((css_x - 960.0).abs() < 1.0);
    }

    #[test]
    fn test_scenario_2_125_percent_windows_scaling() {
        let width = 2560;
        let height = 1440;
        let scale_factor = 1.25;
        let resize_factor = calculate_resize_factor(width, height);
        assert!((resize_factor - 0.6125).abs() < 1e-4);

        let model_x = 612.5;
        let phys_x = model_to_physical_px(model_x, resize_factor);
        assert!((phys_x - 1000.0).abs() < 1.0);

        let css_x = physical_to_css_px(phys_x, scale_factor);
        assert!((css_x - 800.0).abs() < 1.0);
    }

    #[test]
    fn test_scenario_3_150_percent_windows_scaling_4k() {
        let width = 3840;
        let height = 2160;
        let scale_factor = 1.5;
        let resize_factor = calculate_resize_factor(width, height);

        let model_x = 784.0;
        let model_y = 441.0;

        let css_x = model_to_overlay_css_px(model_x, resize_factor, scale_factor);
        let css_y = model_to_overlay_css_px(model_y, resize_factor, scale_factor);

        assert!((css_x - 1280.0).abs() < 1.0);
        assert!((css_y - 720.0).abs() < 1.0);
    }

    #[test]
    fn test_scenario_4_macos_retina_2x() {
        let width = 2880;
        let height = 1800;
        let scale_factor = 2.0;
        let resize_factor = calculate_resize_factor(width, height);

        let model_x = 1440.0 * resize_factor;
        let model_y = 900.0 * resize_factor;

        let css_x = model_to_overlay_css_px(model_x, resize_factor, scale_factor);
        let css_y = model_to_overlay_css_px(model_y, resize_factor, scale_factor);

        assert!((css_x - 720.0).abs() < 1.0);
        assert!((css_y - 450.0).abs() < 1.0);
    }

    #[test]
    fn test_scenario_5_negative_origin_secondary_monitor() {
        let origin_x = -1920;
        let local_x = 500;
        let global_x = physical_to_global_physical_px(local_x, origin_x);
        assert_eq!(global_x, -1420);
    }

    #[test]
    fn test_scenario_6_window_relative_persistence() {
        let rel = compute_window_relative_offset(500, 300, 50, 50, 400, 200);
        assert_eq!(rel.rel_x, 100);
        assert_eq!(rel.rel_y, 100);

        let (new_x, new_y, w, h) = remap_relative_to_window(&rel, 450, 280);
        assert_eq!(new_x, 550);
        assert_eq!(new_y, 380);
        assert_eq!(w, 50);
        assert_eq!(h, 50);
    }

    #[test]
    fn test_scenario_7_rotated_portrait_monitor() {
        let width = 1080;
        let height = 1920;
        let scale_factor = 1.0;
        let resize_factor = calculate_resize_factor(width, height);
        let expected_factor = 1568.0 / 1920.0;
        assert!((resize_factor - expected_factor).abs() < 1e-5);

        let model_y = 800.0 * resize_factor;
        let css_y = model_to_overlay_css_px(model_y, resize_factor, scale_factor);
        assert!((css_y - 800.0).abs() < 1.0);
    }

    #[test]
    fn test_scenario_8_200_percent_windows_scaling() {
        let width = 3840;
        let height = 2160;
        let scale_factor = 2.0;
        let resize_factor = calculate_resize_factor(width, height);

        let model_x = 1000.0 * resize_factor;
        let model_y = 500.0 * resize_factor;

        let css_x = model_to_overlay_css_px(model_x, resize_factor, scale_factor);
        let css_y = model_to_overlay_css_px(model_y, resize_factor, scale_factor);

        assert!((css_x - 500.0).abs() < 1.0);
        assert!((css_y - 250.0).abs() < 1.0);
    }
}
