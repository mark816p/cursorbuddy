# Cursorbuddy

> **A cross-platform (Windows 10/11 & macOS 12+) AI desktop companion that teaches you where to click rather than automating clicks.**

Built with **Tauri 2**, **Rust**, **React**, **Hono**, and **Anthropic Claude**.

---

## Key Features

- **Push-to-Talk Screen Guidance**: Hold `Ctrl+Alt` (Windows) or `Option+Command` (macOS), ask a voice question about your screen, and release. Cursorbuddy speaks concise guidance and highlights the exact button, menu, or control.
- **Teaches, Never Clicks**: Cursorbuddy empowers and teaches the user how to navigate their applications; it never auto-clicks or executes destructive actions on their behalf.
- **Dynamic Accessibility Snapping**: Deep integration with Windows UIAutomation and macOS Accessibility APIs automatically snaps SVG annotations (circles, arrows, highlights, notes) to native OS control bounds.
- **High-Speed Voice Dictation**: Hold `Ctrl+Alt+Shift` (Windows) or `Option+Command+Shift` (macOS) to dictate text directly into any focused application. Cursorbuddy pastes the transcription and restores your original clipboard contents within 50ms.
- **Local Pre-Upload Redaction**: Password managers (1Password, Bitwarden, KeePass, etc.), financial/banking sites, and private/incognito browser windows are automatically detected and blacked out on-device before any image leaves your computer.
- **Zero-Disk Ephemeral Media**: Audio and screen captures are processed strictly in RAM ring buffers and never written to disk (except when user explicitly enables Debug Mode in Settings).
- **Anti-Capture Click-Through Overlays**: Transparent, frameless overlay webviews are protected at the OS level (`SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)` / `NSWindowSharingNone`), ensuring annotations never recurse into screen captures.
- **Non-Destructive File Modification Undo Journal**: Background file organization workflows strictly forbid deletions and record all moves/renames to a transactional journal supporting instant one-click undo.
- **Animated Mascot Companion**: Physics-driven damped spring mascot reacts in real-time with listening energy waveforms, lip-sync mouth morphing, pointing gestures, and emotion states.

---

## Architecture & Monorepo Structure

```
cursorbuddy/
├── apps/
│   ├── desktop/              # Tauri 2 Desktop Client (Rust + React 18 + TailwindCSS)
│   │   ├── src-tauri/        # Native Rust core (xcap, cpal, rodio, rdev, uiautomation)
│   │   └── src/              # React frontend (Mascot, Overlays, Settings, Onboarding)
│   └── server/               # Hono TypeScript API (Cloud Backend)
│       └── src/              # STT (Whisper), Claude Opus/Sonnet forced tool use, TTS
├── packages/
│   └── shared/               # Isomorphic Zod schemas, types & coordinate transformation math
├── supabase/
│   └── migrations/           # Database schema with RLS & atomic quota stored procedures
└── docs/
    ├── ARCHITECTURE.md       # Comprehensive subsystem architectural documentation
    ├── DECISIONS.md          # Architecture Decision Records (ADRs)
    └── PLAN.md               # 10-milestone project blueprint
```

---

## Coordinate Transformation Pipeline

Visual LLM predictions are systematically mapped from resized JPEG coordinates to physical display pixels and webview CSS pixels:

$$\text{Model Pixels } (x_m, y_m) \xrightarrow{/ \text{ resize\_factor}} \text{Physical Display Pixels } (x_p, y_p) \xrightarrow{/ \text{ scale\_factor}} \text{Webview CSS Pixels } (x_{\text{css}}, y_{\text{css}})$$

- Supports signed multi-monitor offsets and negative-origin secondary displays.
- Active window tracking at 4 Hz hides, restores, and translates annotations when windows move.

---

## Prerequisites

- **Node.js**: `v20.x` or later (tested on `v24.x`)
- **pnpm**: `v9.x` or later (tested on `v12.x`)
- **Rust**: Stable toolchain via `rustup` (`https://rustup.rs`)
- **Tauri CLI 2.x**: `cargo install tauri-cli --version "^2" --locked` (or use via `pnpm dlx @tauri-apps/cli`)
- **Windows**: Visual Studio 2022+ C++ Build Tools ("Desktop development with C++"), WebView2 Evergreen Runtime.
- **macOS**: Xcode Command Line Tools (`xcode-select --install`).

---

## Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/cursorbuddy/cursorbuddy.git
cd cursorbuddy
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `apps/server` to `apps/server/.env` and supply your API keys:
```env
PORT=3001
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Run the Backend Server
```bash
pnpm --filter server dev
```

### 4. Run the Desktop Application
```bash
pnpm --filter desktop dev
```

---

## Verification & Testing

Cursorbuddy includes comprehensive unit and integration test suites:

```bash
# Run all TypeScript unit tests (coordinate conversions, Zod schemas, server fixtures)
pnpm test

# Run Rust unit tests (coordinate engine, redaction matcher, audio buffers, undo journal)
cargo test --workspace

# Run TypeScript typechecks across all workspaces
pnpm typecheck

# Run ESLint across packages
pnpm lint

# Run Rust Clippy checks
cargo clippy --workspace --all-targets -- -D warnings
```

---

## Privacy & Safety Directives

1. **Explicit Capture Only**: Screen is captured exclusively while the push-to-talk hotkey is held or for explicit user-initiated background jobs.
2. **Zero-Disk Ephemeral Media**: Mic audio and screen captures are held in RAM ring buffers and immediately released.
3. **Local Pre-Upload Redaction**: Sensitive windows (password managers, banking sites, private browsing windows) are redacted locally on-device.
4. **Teach, Never Click**: Cursorbuddy highlights and explains; it never clicks for the user.
5. **No Client Secrets**: API keys reside solely on the secure backend server.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
