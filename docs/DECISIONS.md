# Architecture Decision Records (ADRs)

## ADR-001: Monorepo Architecture with pnpm & Cargo Workspaces
- **Status**: Accepted
- **Context**: The project combines a Rust/Tauri desktop application, a Hono TypeScript backend, and shared TypeScript types and Zod schemas.
- **Decision**: Use a `pnpm` workspace for TypeScript packages (`apps/server`, `apps/desktop`, `packages/shared`) alongside a virtual `Cargo` workspace at the root for Rust crates.
- **Consequences**: Enables code reuse between frontend and server via `@cursorbuddy/shared` with zero bundling overhead, while maintaining isolated dependency graphs.

## ADR-002: In-Memory Zero-Disk Audio & Screen Processing Pipeline
- **Status**: Accepted
- **Context**: User privacy is paramount. Screen captures and microphone audio must not leak or persist locally.
- **Decision**: Stream mic audio directly into in-memory ring buffers (`cpal` -> `rubato` -> `hound` WAV in RAM) and capture screen frames to memory buffers (`xcap` -> `RgbaImage` in RAM). Discard immediately after HTTP dispatch.
- **Consequences**: Zero trace of user audio or screens on disk. Only user-enabled Debug Mode creates temporary files in an isolated temp folder with an explicit UI indicator.

## ADR-003: Coordinate Transformation Strategy
- **Status**: Accepted
- **Context**: Visual LLM predictions are in resized JPEG pixel coordinates. High-DPI scaling (125%, 150%, 200%), multi-monitor offsets (including negative origins), and webview logical CSS pixels cause misalignment if not systematically converted.
- **Decision**: Define a single pure transformation pipeline:
  $$\text{Model Pixels} \xrightarrow{/ \text{ resize\_factor}} \text{Physical Display Pixels} \xrightarrow{/ \text{ scale\_factor}} \text{Webview CSS Pixels}$$
  Implement this with signed arithmetic in both Rust (`coords.rs`) and TypeScript (`packages/shared/src/coordinates.ts`), backed by a 100% test matrix.
- **Consequences**: Guarantees sub-10px accuracy across mixed-DPI multi-monitor configurations.

## ADR-004: Anti-Capture Protection for Overlays
- **Status**: Accepted
- **Context**: Transparent overlay windows could accidentally be captured by subsequent screenshot requests, causing feedback loops or obscuring real UI.
- **Decision**: Apply OS-level capture exclusion via `window.set_content_protected(true)` (`SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)` on Windows, `NSWindow.sharingType = .none` on macOS).
- **Consequences**: Overlays remain visible to the user but completely invisible to `xcap`, OBS, and screenshot utilities.

## ADR-005: Low-Level Modifier Hotkeys via rdev
- **Status**: Accepted
- **Context**: The Tauri `global-shortcut` plugin cannot register modifier-only combinations like `Ctrl+Alt` or `Option+Command`. Furthermore, Windows international layouts often map AltGr to `Ctrl+Alt`.
- **Decision**: Use `rdev` on a dedicated background event thread to listen to raw key down/up events. Implement extended keycode filtering on Windows to differentiate Left Alt vs Right Alt (AltGr), and display an informative warning banner in the Settings UI when an AltGr layout is active.
- **Consequences**: Enables responsive push-to-talk with standard modifier chords while mitigating international keyboard conflicts.
