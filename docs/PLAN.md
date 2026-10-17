# Cursorbuddy: Cross-Platform AI Desktop Companion
## Implementation Plan & Architectural Blueprint (Milestones M1–M10)

---

## 1. Context & Objectives

### Problem & Purpose
Computer users often get stuck trying to find specific settings, controls, or multi-step workflows across complex desktop applications. Traditional screen assistants either automate clicks directly (risking unintended destructive actions and preventing the user from learning) or provide text-only instructions that are hard to map to visual layouts.

### Solution: "Cursorbuddy"
Cursorbuddy is a cross-platform (Windows 10/11 and macOS 12+) AI desktop companion built with Tauri 2, Rust, React, Hono, and Anthropic Claude.
- **Push-to-Talk Screen Assistance**: The user holds a global hotkey (`Ctrl+Alt` on Windows, `Option+Command` on Mac), speaks a question about what is currently on their screen, and releases the key.
- **Visual & Spoken Guidance**: The desktop client captures only the active display under the cursor, redacts sensitive windows locally, downscales the frame, and posts the audio and image to a secure Hono backend. The backend transcribes the audio, queries Claude with a structured `respond` tool, and returns validated spoken guidance alongside visual SVG annotations (circles, arrows, highlights, notes) displayed on a transparent, click-through overlay.
- **Teaches, Never Clicks**: Cursorbuddy highlights the next step and explains *why*, teaching the user how to navigate their system without ever clicking or taking destructive actions on their behalf.
- **Dictation Mode**: Holding `Ctrl+Alt+Shift` (`Option+Command+Shift`) activates high-speed speech-to-text dictation that pastes directly into the focused field and restores the user's prior clipboard content.

---

## 2. Prerequisites & Environment Status

An environment inspection on this Windows 11 host (`C:\Users\kinja`) revealed the following status:

| Dependency | Required | Current System Status | Action Required |
| :--- | :--- | :--- | :--- |
| **Node.js** | 20+ | `v24.14.1` | None (Satisfied) |
| **pnpm** | 9+ | `12.9.1` | None (Satisfied) |
| **Git** | Any | `2.44.0.windows.1` | None (Satisfied) |
| **Visual Studio C++ Build Tools** | VS 2022+ C++ / MSVC | Installed (VS Build Tools 2026, MSVC `14.51.36231`, Windows SDK `10.0.26100.0`) | None (Satisfied) |
| **WebView2 Runtime** | Evergreen Runtime | Installed (`155.0.4283.62`) | None (Satisfied) |
| **Rust Toolchain** | Stable via rustup | **Not Installed** (`rustc` / `cargo` missing in PATH) | **User to install via `https://rustup.rs`** |
| **Tauri CLI 2.x** | `cargo-tauri` 2.x | **Not Installed** | **User to run `cargo install tauri-cli --version "^2" --locked` (or run via `pnpm dlx @tauri-apps/cli`)** |

*Note: System-level software will not be silently installed. Rust and Tauri CLI installation must be completed by the user.*

---

## 3. Architecture & Repository Layout

The project resides in `C:\Users\kinja\cursorbuddy\` configured as a unified monorepo with a `pnpm` workspace (TypeScript/React/Hono) and a `Cargo` virtual workspace (Rust/Tauri).

```
C:\Users\kinja\cursorbuddy\
├── pnpm-workspace.yaml
├── package.json
├── Cargo.toml                          # Cargo virtual workspace root
├── rust-toolchain.toml                 # Pinned Rust stable
├── CLAUDE.md                           # Stack, commands, conventions, privacy rules
├── .env.example                        # Documented environment template
├── docs/
│   ├── PLAN.md                         # This plan
│   ├── ARCHITECTURE.md                 # Detailed architecture documentation
│   └── DECISIONS.md                    # Architecture Decision Records (ADRs)
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Lint, typecheck, unit tests
│       └── release.yml                 # Matrix release builds (windows-latest, macos-latest)
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql     # Profiles, usage, jobs, invites, subscriptions
│       └── 0002_quota_functions.sql    # Atomic stored procedures for quota checks
├── packages/
│   └── shared/                         # Isomorphic schemas, types, coordinate math
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── schemas/
│           │   ├── ask.ts              # Zod schemas for /ask request, metadata, tool input
│           │   ├── dictate.ts          # Zod schemas for /dictate
│           │   ├── annotations.ts      # Annotation primitives, types, bounds
│           │   └── auth.ts             # Profile, token, invite, billing schemas
│           └── coordinates.ts          # Pure TS coordinate conversion mirror (+ Vitest)
├── apps/
│   ├── server/                         # Hono TypeScript API
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                # Server entrypoint and route mounting
│   │       ├── middleware/
│   │       │   ├── auth.ts             # Supabase JWT verification via jose
│   │       │   └── quota.ts            # Rate limiting and atomic quota enforcement
│   │       ├── routes/
│   │       │   ├── ask.ts              # STT -> Claude tool call -> JSON / TTS stream
│   │       │   ├── dictate.ts          # Whisper transcription endpoint
│   │       │   ├── tts.ts              # Audio streaming proxy
│   │       │   ├── billing.ts          # Stripe checkout & customer portal
│   │       │   ├── webhooks.ts         # Stripe webhook listener
│   │       │   └── health.ts           # Liveness/readiness probes
│   │       └── services/
│   │           ├── anthropic.ts        # Anthropic SDK client & structured tool loop
│   │           ├── stt.ts              # Whisper STT service (OpenAI / Deepgram)
│   │           ├── tts.ts              # ElevenLabs / OpenAI TTS stream generator
│   │           └── db.ts               # Supabase database client
│   └── desktop/                        # Tauri 2 Desktop Application
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── src-tauri/
│       │   ├── Cargo.toml
│       │   ├── tauri.conf.json
│       │   ├── capabilities/
│       │   │   └── default.json        # Tauri 2 minimal privilege capabilities
│       │   ├── icons/
│       │   └── src/
│       │       ├── main.rs             # Tauri lifecycle, plugins, single-instance
│       │       ├── tray.rs             # System tray, context menus, pause state
│       │       ├── hotkey.rs           # rdev / low-level push-to-talk & dictation hook
│       │       ├── coords.rs           # Pure Rust coordinate conversion engine (+ tests)
│       │       ├── audio/
│       │       │   ├── mod.rs
│       │       │   ├── capture.rs      # cpal 16 kHz mono PCM capture & in-memory WAV
│       │       │   └── playback.rs     # rodio audio streaming playback & interrupt
│       │       ├── screen/
│       │       │   ├── mod.rs
│       │       │   ├── capture.rs      # xcap cursor display detection & capture
│       │       │   ├── redact.rs       # Sensitive window enumeration & blackout
│       │       │   └── rescale.rs      # Lanczos downscaling (<=1568px) & JPEG encode
│       │       ├── overlay/
│       │       │   ├── mod.rs
│       │       │   ├── manager.rs      # Multi-monitor transparent click-through windows
│       │       │   └── persistence.rs  # 4 Hz active window polling & re-mapping
│       │       ├── mascot/
│       │       │   ├── mod.rs
│       │       │   └── physics.rs      # Damped spring follow-cursor physics
│       │       ├── dictate/
│       │       │   ├── mod.rs
│       │       │   └── paste.rs        # arboard clipboard restore + enigo paste
│       │       └── accessibility/      # Milestone 8 UI automation grounding
│       │           ├── mod.rs
│       │           ├── windows_uia.rs  # Windows UIAutomation COM interface
│       │           └── macos_ax.rs     # macOS ApplicationServices Accessibility API
│       └── src/                        # React 18 UI
│           ├── index.html
│           ├── main.tsx                # Window router by Tauri label
│           ├── mascot/
│           │   ├── MascotWindow.tsx    # Mascot canvas host
│           │   ├── RiveMascot.tsx      # Rive runtime state machine
│           │   └── SvgFallback.tsx     # Animated SVG sprite sheet fallback
│           ├── overlay/
│           │   ├── OverlayWindow.tsx   # Fullscreen transparent SVG canvas
│           │   ├── AnnotationLayer.tsx # Framer-motion animated SVG marks
│           │   └── DebugGrid.tsx       # Calibration & crosshair coordinate grid
│           └── settings/
│               ├── SettingsWindow.tsx  # Tabs: General, Hotkeys, Privacy, Account
│               ├── HotkeyConfig.tsx    # Push-to-talk settings + AltGr layout banner
│               ├── BlocklistConfig.tsx # Window title & process redaction rules
│               └── DebugPanel.tsx      # Calibration view & capture inspection
```

---

## 4. Key Subsystem Designs & Implementation Strategies

### 4.1 Coordinate Accuracy & Multi-Monitor Math
The critical mathematical pipeline maps model prediction coordinates to webview CSS pixels:
1. **Model Coordinates $(x_m, y_m, w_m, h_m)$**: In pixels relative to the resized JPEG ($W_{\text{model}} \times H_{\text{model}}$).
2. **Physical Capture Coordinates $(x_p, y_p, w_p, h_p)$**:
   $$\text{resize\_factor} = \frac{1568}{\max(W_{\text{phys}}, H_{\text{phys}})} \quad (\text{if } \max(W_{\text{phys}}, H_{\text{phys}}) > 1568, \text{ else } 1.0)$$
   $$x_p = \frac{x_m}{\text{resize\_factor}}, \quad y_p = \frac{y_m}{\text{resize\_factor}}, \quad w_p = \frac{w_m}{\text{resize\_factor}}, \quad h_p = \frac{h_m}{\text{resize\_factor}}$$
3. **Overlay Webview CSS Logical Pixels $(x_{\text{css}}, y_{\text{css}}, w_{\text{css}}, h_{\text{css}})$**:
   Because each monitor hosts an independent fullscreen transparent window spanning its own physical bounds:
   $$x_{\text{css}} = \frac{x_p}{\text{scale\_factor}} = \frac{x_m}{\text{resize\_factor} \times \text{scale\_factor}}$$
4. **Multi-Monitor Global Offsets**:
   Physical coordinates across the virtual desktop take monitor origin into account:
   $$X_{\text{global\_phys}} = X_{\text{monitor\_origin\_phys}} + x_p$$
   Secondary displays situated to the left or above primary display have negative origins (e.g. $X_{\text{origin}} = -1920$). All calculations use signed arithmetic and will be verified by a unit test matrix covering:
   - 100%, 125%, 150%, 200% Windows scaling
   - macOS Retina 2x displays
   - Negative-origin secondary displays
   - Vertical/portrait secondary displays ($90^\circ$ rotation)

### 4.2 LLM Interaction Contract & Robust Validation
- **Model**: `claude-sonnet-5-5` (default) / `claude-haiku-5-5` (fast) via `@anthropic-ai/sdk`.
- **System Prompt**: Enforces concise speech (max 3 short conversational sentences, no markdown), single-step focus, and explicit clarification when uncertain.
- **Forced Tool Schema (`respond`)**:
  - `speech`: string (<= 500 chars, max 3 conversational sentences, no markdown)
  - `confidence`: `"high"` | `"medium"` | `"low"`
  - `needs_clarification`: boolean
  - `annotations`: array (max 3) of `{ step: int, type: "circle"|"arrow"|"highlight"|"note", x, y, w, h: int, from_x?, from_y?, to_x?, to_y?, label?: string (<=6 words), element_id?: string }`
- **Validation & Self-Correction**:
  Validated with Zod in `@cursorbuddy/shared`. If validation fails, retry once with the Zod validation error appended to the conversation. If retry fails, fall back to speech-only response with `confidence: "low"`.

### 4.3 Transparent Overlay & Anti-Capture Protection
- One transparent, frameless, click-through window per connected monitor:
  `WebviewWindowBuilder::new(app, label, WebviewUrl::App("overlay".into()))`
  `.transparent(true).decorations(false).always_on_top(true).skip_taskbar(true).shadow(false).focused(false)`
- Native click-through: `set_ignore_cursor_events(true)`. On Windows, set `WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_NOACTIVATE`. On macOS, set `ignoresMouseEvents = YES`.
- Anti-capture protection: Call `window.set_content_protected(true)`.
  - Windows: Sets `SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)`. Overlays are completely invisible to `xcap` and screen recorders.
  - macOS: Sets `NSWindow.sharingType = NSWindowSharingNone`.
- Per-window persistence: Background thread polls the OS foreground window at ~4 Hz (`GetForegroundWindow` / `NSWorkspace.frontmostApplication`). If foreground changes, hide overlay. If user returns, restore overlay and offset coordinates by $(\Delta x, \Delta y)$ if the target window moved.

### 4.4 Mascot State Machine & Physics
- Mascot rendered in a 160x160 px transparent webview window following the cursor.
- Critically damped harmonic oscillator physics ($F = -k \Delta x - c v$, $\zeta = 1.0$) prevents jitter and guarantees zero overshoot.
- States:
  - `idle`: Subtle breathing animation.
  - `listening`: Triggered on hotkey press. Waveform ring expands based on real-time mic RMS levels.
  - `thinking`: Floating loop with sparkle effect.
  - `speaking`: Lip-sync mouth movement driven by TTS playback amplitude envelopes.
  - `pointing`: Arm gesture pointing toward the primary annotation target $(x_{\text{css}}, y_{\text{css}})$.
  - `happy`: Quick nod/flip upon successful resolution.
  - `confused`: Head tilt with question mark when `needs_clarification === true` or `confidence === "low"`.
  - `error`: Subtle concerned expression on network/API failure.
  - `paused`: Sleeping (Zzz) when paused from tray or settings.
- Implemented with `@rive-app/react-canvas` with animated SVG sprite sheet fallback.

### 4.5 Privacy & Security Guardrails
1. **Zero-Disk Ephemeral Media**:
   - Mic audio captured directly into in-memory ring buffer (`Arc<Mutex<Vec<i16>>>`), resampled to 16 kHz mono PCM in RAM, encoded to in-memory WAV, and immediately cleared.
   - Screen captures never saved to disk (except when user explicitly enables Debug Mode in Settings).
2. **Local Pre-Upload Redaction**:
   - Before downscaling or network egress, `xcap::Window::all()` enumerates visible windows on the target display.
   - Bounding boxes of matched windows are painted with charcoal `#18181B` directly on the `RgbaImage`:
     - Password managers: 1Password, Bitwarden, KeePass, LastPass, Dashlane, Enpass, Proton Pass.
     - Financial/Banking keywords: `(?i)(bank|banking|chase|wells fargo|citi|capital one|fidelity|schwab|paypal|revolut)`.
     - Incognito/Private browser windows: `Incognito`, `InPrivate`, `Private Browsing`.
     - User-defined process/title blocklist from Settings.
3. **No Secret Leaks**:
   - Client bundle contains zero API keys. All LLM/STT/TTS keys reside solely on the Hono server.
   - Supabase JWT verified via `jose` on all endpoints.

---

## 5. Milestone Execution Roadmap (M1–M10)

### Milestone 1: Monorepo Scaffolding, Tauri Tray Application & Shared Types
- **Tasks**:
  1. Initialize root `pnpm-workspace.yaml`, root `Cargo.toml`, and `.gitignore`.
  2. Setup `packages/shared`:
     - Zod schemas: `ask.ts`, `annotations.ts`, `dictate.ts`, `auth.ts`.
     - Pure coordinate mapping module: `coordinates.ts`.
     - Unit tests in Vitest for coordinate mathematics.
  3. Scaffold `apps/desktop`:
     - Tauri 2 CLI setup with React, Vite, TypeScript, TailwindCSS.
     - `src-tauri/tauri.conf.json` with multi-window declarations (`main`, `settings`, `mascot`).
     - System tray implementation in `tray.rs` (Status, Pause/Resume, Settings, Quit).
     - Settings window with tabs (General, Hotkeys, Privacy, Account).
  4. Scaffold `apps/server`:
     - Hono API skeleton with `/health` route and CORS setup.
  5. Setup CI skeleton in `.github/workflows/ci.yml`.
- **Commit**: `feat: M1 monorepo scaffolding, tray app, and shared types`
- **Verification**: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `cargo clippy`, `cargo test`.

### Milestone 2: Hotkey Pipeline, Low-Latency Mic Capture & Mascot Listening State
- **Tasks**:
  1. Low-level global keyboard listener via `rdev` in `src-tauri/src/hotkey.rs`:
     - Detect modifier press/release (`Ctrl+Alt` on Windows, `Opt+Cmd` on Mac).
     - Detect dictation combo (`Ctrl+Alt+Shift` / `Opt+Cmd+Shift`).
     - Detect AltGr on Windows international layouts; show banner in Settings.
  2. In-memory microphone capture via `cpal` + `rubato` in `src-tauri/src/audio/capture.rs`:
     - Capture system default mic directly into RAM buffer.
     - Resample to 16 kHz mono PCM in memory; encode to WAV via `hound`.
     - Calculate real-time RMS energy (0.0 to 1.0) every 50ms and emit to webview.
  3. Mascot window & listening animation:
     - Damped spring cursor follow physics in `physics.rs`.
     - Mascot reacts to `hotkey_down` with listening state and pulsing energy ring.
- **Commit**: `feat: M2 hotkey pipeline, mic capture, and mascot listening state`
- **Verification**: Hotkey activates audio capture and mascot animation; zero disk writes verified.

### Milestone 3: Display Detection, Redaction Pipeline, Rescaling & Debug Capture
- **Tasks**:
  1. Target display detection via `xcap` in `src-tauri/src/screen/capture.rs`:
     - Query cursor position; identify and capture only the display containing the cursor.
  2. Sensitive window enumeration & blackout in `src-tauri/src/screen/redact.rs`:
     - Query visible windows; match password managers, banking terms, incognito titles, and user blocklist.
     - Draw solid black/charcoal rectangles over matched window regions.
  3. Rescaling & JPEG encoding in `src-tauri/src/screen/rescale.rs`:
     - Downscale image using Lanczos3 so long edge <= 1568px; record `resize_factor`.
     - Encode to JPEG quality 85 in memory.
  4. Debug mode toggle in Settings:
     - Save capture to temporary path and preview redacted boxes and geometry in Debug panel.
- **Commit**: `feat: M3 screen capture, redaction pipeline, and downscaling`
- **Verification**: Unit tests on blocklist matcher; debug preview validates redacted regions.

### Milestone 4: Server Pipeline with STT, Claude Tool Use & Fixture Tests
- **Tasks**:
  1. Hono `/ask` endpoint in `apps/server/src/routes/ask.ts`:
     - Accept multipart form: `audio` (WAV), `image` (JPEG), `metadata` (JSON).
  2. STT service in `apps/server/src/services/stt.ts`:
     - Transcribe WAV buffer via Whisper API.
  3. Claude integration in `apps/server/src/services/anthropic.ts`:
     - System prompt with teaching rules, single-step constraint, and no-markdown speech.
     - Tool definition `respond` with strict Zod schema.
  4. Validation & self-correction loop:
     - Validate output; retry once with Zod errors on failure; fall back to speech-only.
  5. Fixture test suite in `apps/server/test/ask_fixtures.test.ts`:
     - Test across 5 static UI screenshots (VS Code, Chrome, Settings, etc.).
- **Commit**: `feat: M4 server ask pipeline with STT and Claude tool use`
- **Verification**: `pnpm --filter server test` passes against fixture screenshots.

### Milestone 5: Transparent Overlay Windows, Annotation Rendering & Coordinate Accuracy
- **Tasks**:
  1. Multi-monitor overlay manager in `src-tauri/src/overlay/manager.rs`:
     - Spawn one transparent, frameless, click-through window per display.
     - Apply `set_content_protected(true)` to exclude from captures.
  2. Coordinate conversion engine in `src-tauri/src/coords.rs` & `packages/shared/src/coordinates.ts`:
     - Comprehensive unit test matrix (100%, 125%, 150%, 200%, negative origins, rotated displays).
  3. React SVG annotation renderer in `apps/desktop/src/overlay/`:
     - Draw animated circles, arrows, highlights, notes with Framer Motion.
     - 30s auto-fade or instant dismiss on `Esc`.
  4. Active window tracking in `src-tauri/src/overlay/persistence.rs`:
     - Poll foreground window at 4 Hz; hide overlay when unfocused; restore and re-map when refocused.
  5. Calibration crosshair grid in `apps/desktop/src/overlay/DebugGrid.tsx`.
- **Commit**: `feat: M5 overlay windows, annotation rendering, and coordinate accuracy`
- **Verification**: Coordinate matrix unit tests pass; overlay ignores clicks and excludes itself from captures.

### Milestone 6: TTS Audio Streaming, Mascot State Integration & Dictation Mode
- **Tasks**:
  1. TTS streaming endpoint in `apps/server/src/routes/tts.ts`:
     - Stream audio chunks via ElevenLabs / OpenAI TTS.
  2. Audio playback via `rodio` in `src-tauri/src/audio/playback.rs`:
     - Stream audio into `rodio::Sink`; instant interruption on new hotkey or `Esc`.
     - Emit amplitude envelopes to webview for lip-sync.
  3. Mascot state machine completion:
     - Transitions: `thinking` -> `speaking` -> `pointing` -> `happy` / `confused`.
  4. Dictation paste mode in `src-tauri/src/dictate/paste.rs`:
     - Send audio to `/dictate`.
     - Backup clipboard (`arboard`) -> set text -> simulate `Ctrl+V`/`Cmd+V` (`enigo`) -> restore clipboard.
- **Commit**: `feat: M6 TTS streaming, mascot states, and dictation paste mode`
- **Verification**: Audio plays with instant cut-off; mascot synchronizes states; dictation preserves clipboard.

### Milestone 7: Supabase Authentication, Quotas, Invites & Stripe Billing
- **Tasks**:
  1. Supabase database migrations in `supabase/migrations/`:
     - Tables: `profiles`, `usage`, `invites`, `subscriptions` with RLS.
     - Stored procedure `increment_user_quota` for atomic quota tracking.
  2. Server auth & quota middleware in `apps/server/src/middleware/`:
     - JWT verification via `jose`; rate limiting; quota checking (Free: 50 asks/mo, Pro: 2,000 asks/mo).
  3. Stripe integration in `apps/server/src/routes/billing.ts` & `webhooks.ts`:
     - Checkout session creation, Customer Portal, and webhook handling.
  4. Desktop auth & usage UI in `apps/desktop/src/settings/`:
     - Secure token storage via `tauri-plugin-keyring`.
     - Account tab: Login, Sign Up, Invite redemption, Usage meter, Upgrade button.
- **Commit**: `feat: M7 auth, quotas, invite codes, and Stripe billing`
- **Verification**: Quota increment procedure unit-tested; expired quotas correctly return upgrade notices.

### Milestone 8: Accessibility-Tree Grounding (Windows UIA & macOS AX)
- **Tasks**:
  1. Windows UIAutomation query in `src-tauri/src/accessibility/windows_uia.rs`:
     - Query focused window interactive elements (`Button`, `MenuItem`, `Edit`, `TabItem`) using `uiautomation`.
     - Extract `name`, `control_type`, `automation_id`, and bounding rectangle.
  2. macOS Accessibility query in `src-tauri/src/accessibility/macos_ax.rs`:
     - Query elements via `ApplicationServices` AX APIs.
  3. Server metadata enrichment in `apps/server/src/services/anthropic.ts`:
     - Pass visible element list in prompt; model returns `element_id` when referencing known elements.
  4. Annotation snapping in `apps/desktop/src/overlay/AnnotationLayer.tsx`:
     - If `element_id` present, snap annotation geometry directly to OS-verified bounding box.
- **Commit**: `feat: M8 accessibility grounding for Windows UIA and macOS AX`
- **Verification**: Verified UI elements snap perfectly to native button bounds.

### Milestone 9: Background Task Workflows, Notifications & Local File Undo Journal
- **Tasks**:
  1. Long-running jobs in `apps/server/src/routes/jobs.ts`:
     - Asynchronous job execution (document summaries, multi-step research).
     - Native desktop notification via `tauri-plugin-notification` upon completion.
  2. Local file modification undo journal in `src-tauri/src/jobs/journal.rs`:
     - Transactional SQLite journal in `~/.cursorbuddy/journal.db`.
     - Records renames and moves (never deletes); supports one-click full undo.
- **Commit**: `feat: M9 background jobs, notifications, and local file undo journal`
- **Verification**: File organization actions record in journal; Undo command restores original paths.

### Milestone 10: Onboarding, Code Signing, Auto-Updater, Security Pass & Release
- **Tasks**:
  1. Permission onboarding flow in `apps/desktop/src/onboarding/`:
     - macOS: Screen Recording, Accessibility, Microphone permission wizard with deep links.
     - Windows: Microphone privacy check.
  2. Tauri auto-updater configuration:
     - `tauri-plugin-updater` with signed manifests on GitHub Releases.
  3. Security & privacy audit:
     - Audit zero unencrypted media on disk; `cargo audit` & `pnpm audit`.
     - Verify overlay exclusion prevents recursive feedback loops in captures.
  4. Release CI pipeline in `.github/workflows/release.yml`:
     - Matrix build (windows-latest, macos-latest) using `tauri-action`.
  5. Documentation:
     - Finalize `README.md`, `CLAUDE.md`, and `/docs/ARCHITECTURE.md`.
- **Commit**: `feat: M10 permission onboarding, updater, signing, and documentation`
- **Verification**: Full release build succeeds; onboarding renders cleanly; security checklist verified.

---

## 6. Verification & Quality Gates

Every milestone must satisfy the following verification checklist before proceeding:
1. **Linting & Typechecking**:
   - `pnpm lint` (ESLint across UI, server, and shared package).
   - `pnpm typecheck` (TypeScript strict mode zero errors).
   - `cargo clippy --all-targets -- -D warnings` (Zero Rust warnings).
2. **Automated Unit & Integration Tests**:
   - `pnpm test` (Shared coordinate conversion tests, Zod validation, server fixture tests).
   - `cargo test` (Rust coordinate mirror tests, redaction regex tests, audio ring buffer tests).
3. **Execution & Manual Verification**:
   - Push-to-talk hotkey response verified under 4 seconds.
   - Screen capture excludes overlays via `set_content_protected(true)`.
   - Blocklisted and private windows fully redacted.
   - Dictation mode pastes text and cleanly restores previous clipboard.
