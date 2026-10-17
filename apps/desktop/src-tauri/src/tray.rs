//! System Tray & Context Menu Management for Cursorbuddy

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIcon, TrayIconBuilder},
    AppHandle, Manager,
};

static IS_PAUSED: AtomicBool = AtomicBool::new(false);

pub fn is_companion_paused() -> bool {
    IS_PAUSED.load(Ordering::Relaxed)
}

pub fn toggle_companion_pause() -> bool {
    let prev = IS_PAUSED.fetch_xor(true, Ordering::Relaxed);
    !prev
}

pub fn create_tray(app: &AppHandle) -> tauri::Result<TrayIcon> {
    let status_i = MenuItem::with_id(app, "status", "Status: Active", false, None::<&str>)?;
    let pause_i = MenuItem::with_id(app, "toggle_pause", "Pause Companion", true, None::<&str>)?;
    let settings_i = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let recalibrate_i = MenuItem::with_id(app, "recalibrate", "Recalibrate Displays", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit Cursorbuddy", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &status_i,
            &pause_i,
            &MenuItem::separator(app)?,
            &settings_i,
            &recalibrate_i,
            &MenuItem::separator(app)?,
            &quit_i,
        ],
    )?;

    let tray = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(move |app, event| {
            match event.id.as_ref() {
                "settings" => {
                    if let Some(win) = app.get_webview_window("settings") {
                        let _ = win.show();
                        let _ = win.set_focus();
                    }
                }
                "toggle_pause" => {
                    let paused = toggle_companion_pause();
                    tracing::info!("Companion pause state toggled: paused={}", paused);
                    // Update menu text if dynamic
                }
                "recalibrate" => {
                    tracing::info!("Display recalibration requested via tray");
                    // Trigger monitor bounds refresh
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(tray)
}
