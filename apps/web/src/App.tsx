import React, { useState, useEffect } from "react";
import {
  Download,
  Mic,
  Monitor,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  CheckCircle2,
  Copy,
  Lock,
  ChevronDown,
  Sparkles,
  MousePointer,
  Volume2,
  RefreshCw,
  ExternalLink,
  Laptop,
} from "lucide-react";

// Direct GitHub Release Download Links
const GITHUB_REPO_URL = "https://github.com/mark816p/cursorbuddy";
const WINDOWS_EXE_URL =
  "https://github.com/mark816p/cursorbuddy/releases/latest/download/Cursorbuddy_0.1.0_x64-setup.exe";
const RELEASES_PAGE_URL = "https://github.com/mark816p/cursorbuddy/releases";

export const App: React.FC = () => {
  // Interactive Simulator State
  const [isPressingHotkey, setIsPressingHotkey] = useState(false);
  const [demoState, setDemoState] = useState<"idle" | "listening" | "thinking" | "speaking">(
    "idle"
  );
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copiedShortcut, setCopiedShortcut] = useState(false);

  // Hotkey simulation timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPressingHotkey) {
      setDemoState("listening");
    } else if (demoState === "listening") {
      setDemoState("thinking");
      timer = setTimeout(() => {
        setDemoState("speaking");
      }, 900);
    }
    return () => clearTimeout(timer);
  }, [isPressingHotkey, demoState]);

  const resetDemo = () => {
    setDemoState("idle");
    setIsPressingHotkey(false);
  };

  const copyShortcuts = () => {
    navigator.clipboard.writeText("Ctrl + Alt");
    setCopiedShortcut(true);
    setTimeout(() => setCopiedShortcut(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              CB
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Cursorbuddy</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                v0.1.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition">
              How It Works
            </a>
            <a href="#demo" className="hover:text-white transition">
              Live Demo
            </a>
            <a href="#privacy" className="hover:text-white transition">
              Privacy First
            </a>
            <a href="#faq" className="hover:text-white transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href={WINDOWS_EXE_URL}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-4 h-4" />
              <span>Download (.exe)</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-28 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>The AI desktop companion that teaches, never clicks.</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Stop searching for buttons. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Let your companion show you where to click.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
              Hold <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-sm">Ctrl + Alt</kbd>, ask a voice question about your screen, and release. Cursorbuddy speaks concise guidance and draws pixel-perfect SVG annotations right over the target control.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href={WINDOWS_EXE_URL}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Download for Windows (.exe)</span>
              </a>

              <a
                href={RELEASES_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
              >
                <span>All Releases & macOS (.dmg)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>One-Click Windows Setup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Continuous Watching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Local Pre-Upload Redaction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-blue-400" />
                <span>Windows 10/11 & macOS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Live Demo Simulator */}
        <section id="demo" className="py-16 border-t border-slate-900 bg-slate-950/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Experience It Live</h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Try the push-to-talk interaction right here in your browser. Hold down the button below, pretend to ask "How do I format this document?", and release!
              </p>
            </div>

            {/* Mock Desktop Window Frame */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
              {/* Window Titlebar */}
              <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">
                    Code Workspace — app.tsx
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>Display 1 (2560x1440 @ 125%)</span>
                </div>
              </div>

              {/* Mock App Screen Canvas */}
              <div className="p-8 h-96 relative bg-slate-950/40 flex flex-col justify-between font-mono text-xs select-none">
                {/* Mock Code Editor Activity Bar & Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-6 text-slate-400">
                    <span className="text-white font-bold">File</span>
                    <span>Edit</span>
                    <span>Selection</span>
                    <span>View</span>
                    <span>Go</span>
                    <span>Run</span>
                    <span>Terminal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="target-format-btn"
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1.5 transition"
                    >
                      <span>Format Document</span>
                    </button>
                    <button className="px-3 py-1 bg-slate-800 text-slate-400 rounded">Run</button>
                  </div>
                </div>

                {/* Mock Code Lines */}
                <div className="space-y-2 text-slate-500 py-6">
                  <div>
                    <span className="text-purple-400">import</span> React{" "}
                    <span className="text-purple-400">from</span>{" "}
                    <span className="text-emerald-300">"react"</span>;
                  </div>
                  <div>
                    <span className="text-purple-400">export const</span> DocumentViewer = () =&gt;
                    &#123;
                  </div>
                  <div className="pl-6 text-slate-400">
                    <span className="text-blue-400">const</span> [state, setState] = useState();
                  </div>
                  <div className="pl-6 text-slate-500">// How do I format this document?</div>
                  <div className="pl-6">
                    <span className="text-purple-400">return</span> &lt;div&gt;Ready&lt;/div&gt;;
                  </div>
                  <div>&#125;;</div>
                </div>

                {/* SVG Annotation Overlay Layer (Rendered when Speaking) */}
                {demoState === "speaking" && (
                  <div className="absolute inset-0 pointer-events-none z-30 animate-in fade-in duration-300">
                    {/* Glowing Target Circle around 'Format Document' */}
                    <div className="absolute top-[30px] right-[78px] w-[148px] h-[36px] border-2 border-blue-400 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse flex items-center justify-center">
                      {/* Step Badge */}
                      <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shadow-md">
                        1
                      </span>
                    </div>

                    {/* Explanatory Note Bubble */}
                    <div className="absolute top-[80px] right-[40px] max-w-xs bg-slate-900/95 border border-blue-500/40 text-slate-200 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans leading-relaxed">
                      <div className="font-semibold text-blue-400 mb-1 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" /> Cursorbuddy Speaks:
                      </div>
                      "Click on 'Format Document' in the top action bar to format your code
                      automatically."
                    </div>
                  </div>
                )}

                {/* Bottom Statusbar */}
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>UTF-8 · TypeScript React · Line 12, Col 8</span>
                  <span>Cursorbuddy Companion: Ready</span>
                </div>
              </div>

              {/* Interactive Controls Bar */}
              <div className="bg-slate-900 border-t border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white transition-all duration-300 ${
                      demoState === "listening"
                        ? "bg-rose-600 scale-110 shadow-lg shadow-rose-500/30"
                        : demoState === "thinking"
                        ? "bg-amber-600 animate-spin"
                        : demoState === "speaking"
                        ? "bg-emerald-600 shadow-lg shadow-emerald-500/30"
                        : "bg-blue-600"
                    }`}
                  >
                    {demoState === "listening" ? (
                      <Mic className="w-6 h-6 animate-pulse" />
                    ) : demoState === "thinking" ? (
                      <RefreshCw className="w-6 h-6" />
                    ) : demoState === "speaking" ? (
                      <Sparkles className="w-6 h-6" />
                    ) : (
                      <MousePointer className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {demoState === "idle" && "Ready to Listen"}
                      {demoState === "listening" && "Listening to Voice..."}
                      {demoState === "thinking" && "Analyzing Screen & Control Tree..."}
                      {demoState === "speaking" && "Guiding Next Click"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {demoState === "idle" && "Press & hold the push-to-talk button to speak"}
                      {demoState === "listening" && "Release button to submit your question"}
                      {demoState === "thinking" && "Grounding coordinates with UIAutomation"}
                      {demoState === "speaking" && "Teaching you where to click (never auto-clicking)"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onMouseDown={() => setIsPressingHotkey(true)}
                    onMouseUp={() => setIsPressingHotkey(false)}
                    onTouchStart={() => setIsPressingHotkey(true)}
                    onTouchEnd={() => setIsPressingHotkey(false)}
                    className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      isPressingHotkey
                        ? "bg-rose-600 text-white shadow-rose-600/30 scale-95"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                    }`}
                  >
                    {isPressingHotkey ? "Release to Send" : "Hold to Talk (Ctrl + Alt)"}
                  </button>

                  {demoState !== "idle" && (
                    <button
                      onClick={resetDemo}
                      className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars / Features */}
        <section id="features" className="py-24 border-t border-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold text-white">Built for True Empowerment</h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                Unlike autonomous clicking bots that risk accidental data corruption, Cursorbuddy teaches you how to navigate your system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Push-to-Talk Screen Assistance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Screen capture triggers exclusively when holding <kbd className="text-blue-400">Ctrl+Alt</kbd>. No continuous background recording or webcam access.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Accessibility Control Snapping</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Integrates with Windows UIAutomation and macOS Accessibility APIs to snap SVG annotations directly to native OS button and menu bounds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Instant Voice Dictation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hold <kbd className="text-purple-400">Ctrl+Alt+Shift</kbd> to dictate text into any focused input. Automatically restores your previous clipboard within 50ms.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Local Pre-Upload Redaction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Password managers, banking portals, and private browser windows are automatically blacked out directly on your GPU before downscaling or sending.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Monitor className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Anti-Capture Click-Through Overlays</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Overlays configure <code className="text-slate-300">WDA_EXCLUDEFROMCAPTURE</code> on Windows, making annotations completely invisible to screen recorders.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Non-Destructive File Journal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Background tasks never delete files. File renames and moves are logged to a transactional journal supporting instant one-click undo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Safety Table */}
        <section id="privacy" className="py-20 bg-slate-900/40 border-t border-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Privacy by Architecture</h2>
              <p className="text-sm text-slate-400">
                How Cursorbuddy protects your data compared to traditional screen assistants.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                    <th className="p-4 font-semibold">Privacy Invariant</th>
                    <th className="p-4 font-semibold text-blue-400">Cursorbuddy</th>
                    <th className="p-4 font-semibold text-slate-500">Autonomous Clickers</th>
                    <th className="p-4 font-semibold text-slate-500">Screen Recorders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="p-4 font-medium text-white">Continuous Background Capture</td>
                    <td className="p-4 text-emerald-400 font-bold">Never (Push-to-Talk only)</td>
                    <td className="p-4 text-rose-400">Yes (Continuous)</td>
                    <td className="p-4 text-rose-400">Yes (Continuous)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Auto-Clicks or Deletes Files</td>
                    <td className="p-4 text-emerald-400 font-bold">Never (Teaches user)</td>
                    <td className="p-4 text-amber-400">Yes (Destructive risks)</td>
                    <td className="p-4 text-slate-400">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Local Password & Banking Blackout</td>
                    <td className="p-4 text-emerald-400 font-bold">Automatic On-Device</td>
                    <td className="p-4 text-rose-400">None</td>
                    <td className="p-4 text-rose-400">None</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Media Saved to Local Disk</td>
                    <td className="p-4 text-emerald-400 font-bold">Zero (Ephemeral RAM only)</td>
                    <td className="p-4 text-amber-400">Varies</td>
                    <td className="p-4 text-rose-400">Yes (Saved to disk)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Clipboard Preservation on Dictate</td>
                    <td className="p-4 text-emerald-400 font-bold">Restored in 50ms</td>
                    <td className="p-4 text-slate-400">N/A</td>
                    <td className="p-4 text-slate-400">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts Cheatsheet */}
        <section className="py-20 border-t border-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Global Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">
                Work across any application on Windows 10/11 and macOS.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Ask Question (Push-to-Talk)</div>
                  <div className="text-xs text-slate-400">
                    Captures active display and speaks guidance
                  </div>
                </div>
                <button
                  onClick={copyShortcuts}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs text-blue-400 font-bold shadow-sm transition active:scale-95"
                  title="Click to copy shortcut"
                >
                  {copiedShortcut ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>Ctrl + Alt</span>
                      <Copy className="w-3 h-3 text-slate-500" />
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Voice Dictation & Paste</div>
                  <div className="text-xs text-slate-400">
                    Pastes transcription and restores clipboard
                  </div>
                </div>
                <kbd className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-purple-400 font-bold shadow-sm">
                  Ctrl + Alt + Shift
                </kbd>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Dismiss Annotations</div>
                  <div className="text-xs text-slate-400">
                    Immediately clears overlays and stops audio
                  </div>
                </div>
                <kbd className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-slate-300 font-bold shadow-sm">
                  Esc
                </kbd>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Pause / Resume Companion</div>
                  <div className="text-xs text-slate-400">
                    Completely disables mic and screen capture
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-lg">
                  System Tray
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-slate-900/30 border-t border-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-sm text-slate-400">Everything you need to know about Cursorbuddy.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "How does Cursorbuddy know where to draw annotations?",
                  a: "When you release the push-to-talk hotkey, Cursorbuddy captures the display containing your cursor, blackouts sensitive windows locally, downscales the frame, and sends it with your audio question to Claude. If Accessibility is enabled, it automatically snaps visual arrows and circles to the exact native OS button bounds via Windows UIAutomation.",
                },
                {
                  q: "Why doesn't Cursorbuddy just click the button for me?",
                  a: "Autonomous clicking agents frequently miss confirmation dialogs, execute destructive actions, and rob users of the ability to learn. Cursorbuddy is intentionally designed to teach you where to click and explain why, so you gain mastery over your software.",
                },
                {
                  q: "Are my screen captures or voice recordings saved to disk?",
                  a: "Never. Mic audio and screen captures are held in in-memory RAM buffers and completely freed after transmission. Screenshots are only saved to disk if you explicitly toggle Debug Mode in Settings.",
                },
                {
                  q: "Can Cursorbuddy see my passwords or banking information?",
                  a: "No. Before any screenshot is processed or leaves your machine, an on-device redaction filter enumerates visible windows and paints solid blackout rectangles over password managers (1Password, Bitwarden, KeePass), banking portals, and private/incognito windows.",
                },
                {
                  q: "How does the Windows one-click installer work?",
                  a: "Clicking the 'Download for Windows (.exe)' button downloads the official NSIS setup executable straight from GitHub Releases. Running it installs Cursorbuddy with one click and places the icon in your system tray.",
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-blue-400 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeFaq === idx ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-blue-950/20 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to navigate your screen with ease?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
              Download the one-click Windows installer and start using Cursorbuddy today.
            </p>
            <div className="pt-2">
              <a
                href={WINDOWS_EXE_URL}
                className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-2xl shadow-blue-600/40 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Download for Windows (.exe)</span>
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Compatible with Windows 10 & 11 (64-bit) · macOS DMG available on GitHub Releases
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-[10px]">
              CB
            </div>
            <span className="text-slate-400 font-semibold">Cursorbuddy</span>
            <span>— Open-Source AI Desktop Companion</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition"
            >
              GitHub
            </a>
            <a
              href={RELEASES_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition"
            >
              Releases
            </a>
            <a
              href={`${GITHUB_REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition"
            >
              MIT License
            </a>
            <a
              href={`${GITHUB_REPO_URL}/blob/main/docs/ARCHITECTURE.md`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition"
            >
              Architecture
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
