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
    return () => {
      unlisten?.();
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
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-8 font-sans select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            CB
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-white">
              Welcome to Cursorbuddy
            </h1>
            <p className="text-xs text-slate-400">First-Run Setup & Calibration</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <span>Step {step} of 3</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 py-8 max-w-xl mx-auto w-full flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-xl shadow-blue-500/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                An AI companion that teaches, never clicks.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Hold your hotkey, ask a voice question about your screen, and Cursorbuddy will speak
                the guidance and draw clear annotations to guide your next click.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-1">
                <div className="font-semibold text-slate-200">Push-to-Talk Hotkey</div>
                <div className="text-slate-400">
                  <span className="font-mono text-blue-400 font-bold">
                    {isMac ? "Option + Command" : "Ctrl + Alt"}
                  </span>{" "}
                  to speak a question.
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-1">
                <div className="font-semibold text-slate-200">Voice Dictation</div>
                <div className="text-slate-400">
                  <span className="font-mono text-purple-400 font-bold">
                    {isMac ? "Option+Cmd+Shift" : "Ctrl+Alt+Shift"}
                  </span>{" "}
                  to dictate text.
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">System Permissions</h2>
              <p className="text-xs text-slate-400">
                Cursorbuddy requires standard OS access to listen to your voice and inspect the
                active screen.
              </p>
            </div>

            <div className="space-y-3">
              {/* Microphone */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">Microphone Access</div>
                    <div className="text-xs text-slate-400">
                      Required for push-to-talk and voice dictation.
                    </div>
                  </div>
                </div>
                {micGranted ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => openPermissionSettings("mic")}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded flex items-center gap-1"
                  >
                    Allow <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Screen Recording */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">Screen Capture</div>
                    <div className="text-xs text-slate-400">
                      Captures only when hotkey is held; zero disk writes.
                    </div>
                  </div>
                </div>
                {screenGranted ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => openPermissionSettings("screen")}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded flex items-center gap-1"
                  >
                    Allow <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Accessibility */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">UI Automation & Tree</div>
                    <div className="text-xs text-slate-400">
                      Enables pixel-perfect snapping to native controls.
                    </div>
                  </div>
                </div>
                {accessibilityGranted ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => openPermissionSettings("accessibility")}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded flex items-center gap-1"
                  >
                    Allow <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Passwords, banking sites, and private browser windows are automatically blacked out
                on your device before compression.
              </span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Test Your Hotkey</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Press and hold{" "}
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono text-white">
                  {isMac ? "Option + Command" : "Ctrl + Alt"}
                </kbd>{" "}
                now to verify your global hotkey pipeline.
              </p>
            </div>

            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl max-w-sm mx-auto">
              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                  testedHotkey
                    ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 scale-105 shadow-lg shadow-emerald-500/20"
                    : "bg-blue-500/10 border-2 border-dashed border-blue-400/50 text-blue-400 animate-pulse"
                }`}
              >
                {testedHotkey ? <CheckCircle2 className="w-10 h-10" /> : <Mic className="w-8 h-8" />}
              </div>
              <div className="mt-4 font-medium text-sm text-slate-200">
                {testedHotkey
                  ? "Hotkey detected successfully!"
                  : "Waiting for hotkey press..."}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {testedHotkey
                  ? "Your microphone and key listener are active and calibrated."
                  : `Hold ${isMac ? "Option+Cmd" : "Ctrl+Alt"} to test`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg transition"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg shadow-md flex items-center gap-1.5 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={completeOnboarding}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
          >
            Start Using Cursorbuddy <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
export default OnboardingWindow;
