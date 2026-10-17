# Cursorbuddy: Developer & Architecture Guide

## 1. Stack Overview

- **Desktop Framework**: Tauri 2 (Cross-platform Windows 10/11 & macOS 12+)
- **Desktop Backend**: Rust (stable), `xcap` (screen capture), `cpal` + `rubato` + `hound` (mic & audio), `rodio` (audio playback), `rdev` (global key hooks), `arboard` + `enigo` (clipboard & paste), `image` + `imageproc` (downscaling & redaction), `keyring` (OS keychain), `uiautomation` (Windows UIA) / `objc2` (macOS AX).
- **Desktop UI**: React 18, TypeScript, Vite, TailwindCSS, Zustand, Framer Motion, `@rive-app/react-canvas` (with SVG sprite fallback), Lucide icons.
- **Backend API**: Hono on Node.js/Bun, TypeScript, `@anthropic-ai/sdk`, OpenAI Whisper / Deepgram (STT), ElevenLabs / OpenAI (TTS), `@supabase/supabase-js`, `stripe`, `jose`, `zod`, `pino`.
- **Shared Package**: `@cursorbuddy/shared` (Zod schemas for `/ask`, `/dictate`, annotations, auth, and isomorphic coordinate conversion).

---

## 2. Essential Commands

### Development
```bash
# Start backend server
pnpm --filter server dev

# Start desktop app in dev mode (requires Rust & Tauri CLI installed)
pnpm --filter desktop dev
# Or directly via cargo-tauri / pnpm dlx
pnpm --filter desktop tauri dev
```

### Build & Release
```bash
# Build all TypeScript packages & webview assets
pnpm build

# Build Tauri desktop release binary
pnpm --filter desktop build
```

### Testing
```bash
# Run all frontend & server unit/integration tests
pnpm test

# Run Rust unit tests
cargo test --workspace

# Run coordinate conversion unit test matrix
pnpm --filter @cursorbuddy/shared test
```

### Linting & Formatting
```bash
# Typecheck TypeScript across all workspaces
pnpm typecheck

# Lint TypeScript code with ESLint
pnpm lint

# Check Rust code quality & warnings
cargo clippy --workspace --all-targets -- -D warnings

# Format code
pnpm format
cargo fmt --all -- --check
```

---

## 3. Architecture Summary

### Pipeline Flow
1. **Push-to-Talk**: User holds `Ctrl+Alt` (Windows) / `Option+Command` (macOS). Mascot appears in `listening` state; `cpal` records mic audio directly into in-memory 16 kHz mono PCM buffer.
2. **Key-Up & Capture**: `xcap` captures only the display under the cursor. Matched sensitive windows (password managers, banking keywords, incognito windows, user blocklist) are blacked out on the raw frame. Image is downscaled ($\le 1568$px long edge).
3. **Server Dispatch**: Audio buffer, JPEG, and geometry metadata sent to Hono `/ask`.
4. **LLM Evaluation**: Audio transcribed via Whisper; Claude Opus 5.5 / Sonnet 5.5 called with forced `respond` tool. Output strictly validated via Zod.
5. **Guidance Delivery**: TTS audio streamed to `rodio`; SVG annotations (circles, arrows, highlights, notes) drawn on transparent, click-through overlay. Mascot animates: `thinking` $\to$ `speaking` $\to$ `pointing` $\to$ `happy`.
6. **Dictation Mode**: `Ctrl+Alt+Shift` (`Option+Command+Shift`) transcribes speech, puts text on clipboard, simulates paste via `enigo`, and restores previous clipboard.

### Coordinate Conversion Pipeline
$$x_m \xrightarrow{/ \text{ resize\_factor}} x_p \xrightarrow{/ \text{ scale\_factor}} x_{\text{css}}$$
- Always use the pure signed-math functions in `packages/shared/src/coordinates.ts` and `apps/desktop/src-tauri/src/coords.rs`.
- Overlays use `set_content_protected(true)` so they never appear in captures.
- Active window is polled at 4 Hz to hide/restore/offset annotations.

---

## 4. Privacy & Safety Rules (Non-Negotiable)

1. **Explicit Capture Only**: Screen is captured **only** while the push-to-talk hotkey is held or for an explicit user-initiated job. Never perform background continuous capture.
2. **Zero-Disk Media Storage**: Mic audio is processed in memory and never written to disk. Screenshots are never saved to disk (except when the user explicitly enables Debug Mode in Settings, which displays an active banner).
3. **Local Pre-Upload Redaction**: Enumerate visible windows and black out password managers (1Password, Bitwarden, KeePass, etc.), banking/payment keywords, and private/incognito browser windows before any image is compressed or sent.
4. **Pause Toggle**: Provide a global Pause toggle in the system tray and Settings that completely disables microphone and screen capture. Show a visible paused indicator.
5. **Ephemeral Server Processing**: The backend server never stores audio or images and logs no content (metadata only: user ID, token counts, latency).
6. **Teach, Never Click**: Cursorbuddy never auto-clicks or executes actions for the user (except pasting in dictation mode).
7. **No Secrets in Client**: Never place API keys, private tokens, or service credentials in client bundles. Never commit `.env` files.
8. **Minimal Permissions**: Restrict Tauri capabilities to the bare minimum; enforce strict CSP; never load remote code in webviews.

---

## 5. Coding Conventions

- **Rust**:
  - Use `anyhow` for application-level errors and `thiserror` for typed domain errors.
  - All shared state protected with `parking_lot::Mutex` or `tokio::sync::Mutex`.
  - Use `tracing` for structured logging.
  - Zero warnings under `cargo clippy --all-targets -- -D warnings`.
- **TypeScript**:
  - Strict mode enabled (`strict: true`). Zero `any` types.
  - Zod schemas serve as the single source of truth for runtime validation and generated TypeScript types.
  - React functional components with explicit props interfaces and TailwindCSS for styling.
