import React, { useState, useEffect } from "react";
import {
  Mic,
  Monitor,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Keyboard,
  ArrowRight,
} from "lucide-react";
import { listen } from "@tauri-apps/api/event";

export const OnboardingWindow: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [micGranted, setMicGranted] = useState<boolean>(true);
  const [screenGranted, setScreenGranted] = useState<boolean>(true);
  const [accessibilityGranted, setAccessibilityGranted] = useState<boolean>(true);
  const [testedHotkey, setTestedHotkey] = useState<boolean>(false);

  const isMac = typeof navigator !== "undefined" && navigator.userAgent.includes("Mac");

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen("hotkey_down", () => {
          setTestedHotkey(true);
        });
      } catch {
        // Fallback in web preview
      }
    };

    setupListener();

    // Also support keyboard testing directly in the window
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.altKey) || (e.metaKey && e.altKey)) {
        setTestedHotkey(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlisten?.();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openPermissionSettings = (type: "mic" | "screen" | "accessibility") => {
    if (type === "mic") setMicGranted(true);
    if (type === "screen") setScreenGranted(true);
    if (type === "accessibility") setAccessibilityGranted(true);

    if (isMac) {
      const urls: Record<string, string> = {
        mic: "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
        screen: "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
        accessibility: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
      };
      window.open(urls[type] || "x-apple.systempreferences:", "_blank");
    } else {
      window.open("ms-settings:privacy-microphone", "_blank");
    }
  };

  const completeOnboarding = () => {
    window.close();
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-8 font-sans select-none overflow-hidden">
      {/* Top Bar with Step Indicators */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
            CB
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Cursorbuddy Setup & Calibration
            </h1>
            <p className="text-[11px] text-slate-400">First-Run Configuration Wizard</p>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: "Welcome" },
            { num: 2, label: "Permissions" },
            { num: 3, label: "Test Hotkey" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                  step === s.num
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : step > s.num
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-900 text-slate-500 border border-slate-800"
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </div>
              {s.num < 3 && <div className="w-3 h-0.5 bg-slate-800" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Step Content */}
      <div className="flex-1 py-6 max-w-xl mx-auto w-full flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                <Sparkles className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                An AI companion that teaches you where to click.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Unlike bots that hijack your cursor and make risky clicks, Cursorbuddy explains the next action and projects clear SVG annotations right over your screen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left pt-2">
              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-blue-400" />
                  <span>Push-to-Talk Hotkey</span>
                </div>
                <div className="text-xs text-slate-400">
                  Hold <kbd className="kbd-key text-blue-300">{isMac ? "Option + Cmd" : "Ctrl + Alt"}</kbd> to ask a voice question about your screen.
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span>Voice Dictation</span>
                </div>
                <div className="text-xs text-slate-400">
                  Hold <kbd className="kbd-key text-purple-300">{isMac ? "Opt+Cmd+Shift" : "Ctrl+Alt+Shift"}</kbd> to transcribe speech and restore clipboard.
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Operating System Permissions</h2>
              <p className="text-xs text-slate-400">
                Cursorbuddy needs standard desktop access to process push-to-talk audio and inspect the active screen.
              </p>
            </div>

            <div className="space-y-3">
              {/* Mic Permission */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Microphone Access</div>
                    <div className="text-[11px] text-slate-400">
                      Captures voice solely while the hotkey is held; zero disk writes.
                    </div>
                  </div>
                </div>
                {micGranted ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => openPermissionSettings("mic")}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl flex items-center gap-1 transition"
                  >
                    Allow <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Screen Recording */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Display Capture</div>
                    <div className="text-[11px] text-slate-400">
                      Captures the active monitor only upon hotkey release. Never runs continuously.
                    </div>
                  </div>
                </div>
                {screenGranted ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => openPermissionSettings("screen")}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl flex items-center gap-1 transition"
                  >
                    Allow <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Accessibility */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Accessibility & UI Tree</div>
                    <div className="text-[11px] text-slate-400">
                      Enables pixel-perfect snapping to native buttons and menus via UIAutomation.
                    </div>
                  </div>
                </div>
                {accessibilityGranted ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => openPermissionSettings("accessibility")}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl flex items-center gap-1 transition"
                  >
                    Allow <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Passwords, banking sites, and incognito browser tabs are automatically blacked out directly on your GPU before downscaling or sending.
              </span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Test Your Global Hotkey</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Press and hold{" "}
                <kbd className="kbd-key text-blue-300">{isMac ? "Option + Command" : "Ctrl + Alt"}</kbd>{" "}
                right now to verify your global hotkey pipeline.
              </p>
            </div>

            <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl max-w-sm mx-auto shadow-xl relative overflow-hidden">
              <div
                className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                  testedHotkey
                    ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 scale-105 shadow-xl shadow-emerald-500/20"
                    : "bg-blue-600/10 border-2 border-dashed border-blue-400/50 text-blue-400 animate-pulse"
                }`}
              >
                {testedHotkey ? (
                  <CheckCircle2 className="w-12 h-12" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </div>

              <div className="mt-5 font-bold text-sm text-slate-100">
                {testedHotkey ? "Hotkey Verified Successfully!" : "Listening for Shortcut..."}
              </div>

              <p className="text-xs text-slate-400 mt-1">
                {testedHotkey
                  ? "Your microphone, screen capture, and global listener are calibrated."
                  : `Press ${isMac ? "Option + Cmd" : "Ctrl + Alt"} to test`}
              </p>

              {!testedHotkey && (
                <button
                  onClick={() => setTestedHotkey(true)}
                  className="mt-4 text-[11px] text-slate-500 hover:text-slate-300 underline"
                >
                  Skip test in simulator mode
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-5">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={completeOnboarding}
            className="px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white rounded-xl shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <span>Start Using Cursorbuddy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
export default OnboardingWindow;
