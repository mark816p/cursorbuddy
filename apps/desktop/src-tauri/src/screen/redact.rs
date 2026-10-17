//! Local Pre-Upload Redaction Engine
//!
//! Enforces non-negotiable privacy: password managers, banking applications,
//! incognito browser windows, and user blocklists are blacked out BEFORE any image leaves RAM.

use image::{Rgba, RgbaImage};
use serde::{Deserialize, Serialize};

pub const DEFAULT_REDACTION_COLOR: Rgba<u8> = Rgba([24, 24, 27, 255]); // Charcoal #18181B

pub const PASSWORD_MANAGERS: &[&str] = &[
    "1password",
    "bitwarden",
    "keepass",
    "keepassxc",
    "lastpass",
    "dashlane",
    "enpass",
    "proton pass",
    "nordpass",
    "authenticator",
];

pub const BANKING_KEYWORDS: &[&str] = &[
    "bank",
    "banking",
    "chase",
    "wells fargo",
    "citi",
    "capital one",
    "fidelity",
    "schwab",
    "paypal",
    "revolut",
    "vanguard",
    "coinbase",
    "binance",
];

pub const PRIVATE_BROWSING_KEYWORDS: &[&str] = &[
    "incognito",
    "inprivate",
    "private browsing",
];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowMeta {
    pub title: String,
    pub app_name: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Default)]
pub struct RedactionFilter {
    pub custom_blocklist: Vec<String>,
}

impl RedactionFilter {
    pub fn new(custom_blocklist: Vec<String>) -> Self {
        Self { custom_blocklist }
    }

    /// Evaluates if a window's title or app name matches any sensitive criteria.
    pub fn should_redact(&self, title: &str, app_name: &str) -> bool {
        let title_lower = title.to_lowercase();
        let app_lower = app_name.to_lowercase();

        // 1. Password managers
        for &pm in PASSWORD_MANAGERS {
            if title_lower.contains(pm) || app_lower.contains(pm) {
                return true;
            }
        }

        // 2. Banking keywords
        for &bank in BANKING_KEYWORDS {
            if title_lower.contains(bank) || app_lower.contains(bank) {
                return true;
            }
        }

        // 3. Private / Incognito browser sessions
        for &priv_mode in PRIVATE_BROWSING_KEYWORDS {
            if title_lower.contains(priv_mode) || app_lower.contains(priv_mode) {
                return true;
            }
        }

        // 4. Custom user blocklist
        for rule in &self.custom_blocklist {
            let rule_lower = rule.to_lowercase();
            if title_lower.contains(&rule_lower) || app_lower.contains(&rule_lower) {
                return true;
            }
        }

        false
    }
}

/// Black out a rectangle on the image in-place.
pub fn blackout_rect(
    img: &mut RgbaImage,
    rect_x: u32,
    rect_y: u32,
    rect_w: u32,
    rect_h: u32,
    color: Rgba<u8>,
) {
    let img_w = img.width();
    let img_h = img.height();

    let start_x = rect_x.min(img_w);
    let start_y = rect_y.min(img_h);
    let end_x = (rect_x + rect_w).min(img_w);
    let end_y = (rect_y + rect_h).min(img_h);

    for y in start_y..end_y {
        for x in start_x..end_x {
            img.put_pixel(x, y, color);
        }
    }
}

/// Redact all sensitive windows intersecting the given monitor image.
pub fn apply_redactions(
    img: &mut RgbaImage,
    monitor_origin_x: i32,
    monitor_origin_y: i32,
    windows: &[WindowMeta],
    filter: &RedactionFilter,
) -> usize {
    let mut redacted_count = 0;

    for win in windows {
        if !filter.should_redact(&win.title, &win.app_name) {
            continue;
        }

        // Translate window coordinates relative to monitor top-left
        let local_x = win.x - monitor_origin_x;
        let local_y = win.y - monitor_origin_y;

        // Check intersection with monitor image bounds
        let img_w = img.width() as i32;
        let img_h = img.height() as i32;

        let intersect_x0 = local_x.max(0);
        let intersect_y0 = local_y.max(0);
        let intersect_x1 = (local_x + win.width as i32).min(img_w);
        let intersect_y1 = (local_y + win.height as i32).min(img_h);

        if intersect_x1 > intersect_x0 && intersect_y1 > intersect_y0 {
            let rect_x = intersect_x0 as u32;
            let rect_y = intersect_y0 as u32;
            let rect_w = (intersect_x1 - intersect_x0) as u32;
            let rect_h = (intersect_y1 - intersect_y0) as u32;

            blackout_rect(img, rect_x, rect_y, rect_w, rect_h, DEFAULT_REDACTION_COLOR);
            redacted_count += 1;
            tracing::info!(
                "Redacted sensitive window '{}' (app: '{}') at ({}, {}, {}, {})",
                win.title,
                win.app_name,
                rect_x,
                rect_y,
                rect_w,
                rect_h
            );
        }
    }

    redacted_count
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_redaction_filter_rules() {
        let filter = RedactionFilter::new(vec!["ConfidentialProject".into()]);

        // Password managers
        assert!(filter.should_redact("1Password - Vault", "1password"));
        assert!(filter.should_redact("Bitwarden Password Manager", "chrome"));
        assert!(filter.should_redact("KeePassXC - Master Key", "keepassxc"));

        // Banking
        assert!(filter.should_redact("Chase Bank: Accounts & Credit Cards", "msedge"));
        assert!(filter.should_redact("Wells Fargo Online", "firefox"));

        // Private / Incognito
        assert!(filter.should_redact("New Incognito Tab - Google Chrome", "chrome"));
        assert!(filter.should_redact("InPrivate Browsing", "msedge"));

        // Custom blocklist
        assert!(filter.should_redact("Top Secret - ConfidentialProject v2", "code"));

        // Regular safe windows
        assert!(!filter.should_redact("Visual Studio Code", "code"));
        assert!(!filter.should_redact("Calculator", "calc"));
    }

    #[test]
    fn test_blackout_rect() {
        let mut img = RgbaImage::new(100, 100);
        // Initially transparent/black
        blackout_rect(&mut img, 10, 10, 20, 20, DEFAULT_REDACTION_COLOR);

        // Point inside redacted region
        assert_eq!(*img.get_pixel(15, 15), DEFAULT_REDACTION_COLOR);
        // Point outside redacted region
        assert_ne!(*img.get_pixel(5, 5), DEFAULT_REDACTION_COLOR);
    }
}
