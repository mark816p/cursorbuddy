//! Downscaling and In-Memory JPEG Compression
//!
//! Constrains the long edge to <= 1568px and preserves aspect ratio.

use std::io::Cursor;
use anyhow::{anyhow, Result};
use image::{imageops::FilterType, DynamicImage, ImageFormat, RgbaImage};

pub const MAX_IMAGE_LONG_EDGE: u32 = 1568;
pub const JPEG_QUALITY: u8 = 85;

/// Downscale image to long edge <= 1568px and encode to in-memory JPEG.
pub fn downscale_and_encode_jpeg(img: &RgbaImage) -> Result<(Vec<u8>, f64)> {
    let orig_w = img.width();
    let orig_h = img.height();

    if orig_w == 0 || orig_h == 0 {
        return Err(anyhow!("Cannot process zero-dimension image"));
    }

    let max_edge = orig_w.max(orig_h);
    let resize_factor = if max_edge > MAX_IMAGE_LONG_EDGE {
        (MAX_IMAGE_LONG_EDGE as f64) / (max_edge as f64)
    } else {
        1.0
    };

    let target_w = ((orig_w as f64) * resize_factor).round() as u32;
    let target_h = ((orig_h as f64) * resize_factor).round() as u32;

    let target_w = target_w.max(1);
    let target_h = target_h.max(1);

    // Perform Lanczos3 downscaling if factor < 1.0, otherwise clone
    let processed_image = if (resize_factor - 1.0).abs() < 1e-5 {
        img.clone()
    } else {
        image::imageops::resize(img, target_w, target_h, FilterType::Lanczos3)
    };

    // Convert RGBA to RGB for standard JPEG encoding
    let dynamic_img = DynamicImage::ImageRgba8(processed_image).to_rgb8();

    let mut jpeg_bytes = Cursor::new(Vec::new());
    dynamic_img.write_to(&mut jpeg_bytes, ImageFormat::Jpeg)?;

    Ok((jpeg_bytes.into_inner(), resize_factor))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_downscale_and_jpeg_encoding() {
        // Create 2560x1440 image
        let img = RgbaImage::new(2560, 1440);
        let (jpeg_bytes, factor) = downscale_and_encode_jpeg(&img).expect("Downscale failed");

        // Factor should be 1568 / 2560 = 0.6125
        assert!((factor - 0.6125).abs() < 1e-4);

        // Verify JPEG magic bytes
        assert!(jpeg_bytes.len() > 100);
        assert_eq!(&jpeg_bytes[0..2], &[0xFF, 0xD8]); // SOI marker
    }
}
