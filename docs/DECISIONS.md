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

## ADR-006: Forced Tool Calling with Strict Zod Self-Correction Loop
- **Status**: Accepted
- **Context**: Visual LLMs can return non-conforming responses (e.g. verbose text, markdown formatting, or hallucinations outside screen boundaries).
- **Decision**: Force the `respond` tool using Anthropic Claude API (`tool_choice: { type: "tool", name: "respond" }`) and validate through strict Zod schemas ($\le 3$ conversational sentences, no markdown, $\le 3$ visual annotations). On schema rejection, automatically append the Zod validation failure and retry once; on second failure, fall back to safe speech-only response.
- **Consequences**: Guarantees predictable frontend rendering and clean UI presentation without crashes.

## ADR-007: Rodio Audio Streaming Playback & Real-Time Lip-Sync Amplitude Envelopes
- **Status**: Accepted
- **Context**: TTS audio must play with minimal latency, support instant interruption when the user speaks again or presses `Esc`, and animate mascot mouth movements.
- **Decision**: Stream audio directly to a native `rodio::Sink` thread, emitting computed chunk RMS amplitude envelopes (0.0 to 1.0) at 20 Hz to webviews for mascot mouth morphing.
- **Consequences**: Realistic lip-sync and low-latency audio playback without writing audio chunks to disk.

## ADR-008: Non-Destructive File Modification Undo Journal
- **Status**: Accepted
- **Context**: Background jobs and assistant workflows must never execute destructive operations or delete user files.
- **Decision**: Implement a transactional SQLite / JSON journal (`~/.cursorbuddy/journal.json`) that strictly permits file renames and moves, never deletions. Record pre- and post-paths for every operation and provide one-click undo.
- **Consequences**: Guaranteed safety invariant: Cursorbuddy never deletes files, and all file adjustments are atomically reversible.

## ADR-009: Accessibility UIAutomation Grounding for Dynamic Control Snapping
- **Status**: Accepted
- **Context**: Visual LLM bounding boxes can vary by several pixels depending on downscaling, font antialiasing, or theme colors.
- **Decision**: Extract native UI hierarchy bounding boxes via Windows UIAutomation (`uiautomation`) and macOS Accessibility (`ApplicationServices`), passing element IDs and names to the model and snapping annotations directly to the OS control bounds on client render.
- **Consequences**: Pixel-perfect alignment to native buttons, menu items, tabs, and edit fields.

## ADR-010: Supabase Row-Locked Atomic Quota Increment & Stripe Tier Enforcement
- **Status**: Accepted
- **Context**: High concurrency or rapid requests could allow users to exceed monthly ask limits (Free: 50 asks/mo, Pro: 2,000 asks/mo).
- **Decision**: Enforce monthly quotas via PostgreSQL stored procedure `increment_user_quota` utilizing `FOR UPDATE` row-level locks on the `usage` table, gated by Supabase JWT authentication.
- **Consequences**: Zero race conditions in quota accounting; strict upgrade prompts when limits are reached.
