import React, { useState, useEffect } from "react";
import { AlertCircle, Keyboard, RefreshCw, CheckCircle2, Sparkles } from "lucide-react";

export const HotkeyConfig: React.FC = () => {
  const [askHotkey, setAskHotkey] = useState("Ctrl + Alt");
  const [dictateHotkey, setDictateHotkey] = useState("Ctrl + Alt + Shift");
  const [isRecording, setIsRecording] = useState<"ask" | "dictate" | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [testDetection, setTestDetection] = useState<string | null>(null);

  // Keyboard chord listener for recording or testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default shortcut behavior during recording
      if (isRecording) {
        e.preventDefault();
        const modifiers: string[] = [];
        if (e.ctrlKey) modifiers.push("Ctrl");
        if (e.altKey) modifiers.push("Alt");
        if (e.shiftKey) modifiers.push("Shift");
        if (e.metaKey) modifiers.push("Cmd");

        let keyName = e.key;
        if (["Control", "Alt", "Shift", "Meta"].includes(keyName)) {
          keyName = "";
        } else if (keyName === " ") {
          keyName = "Space";
        }

        const chord = [...modifiers, ...(keyName ? [keyName.toUpperCase()] : [])];
        setRecordedKeys(chord);

        if (chord.length >= 2 && keyName !== "") {
          const finalChord = chord.join(" + ");
          if (isRecording === "ask") setAskHotkey(finalChord);
          if (isRecording === "dictate") setDictateHotkey(finalChord);
          setIsRecording(null);
          setRecordedKeys([]);
        }
      } else {
        // Live test hotkey detection
        const mods: string[] = [];
        if (e.ctrlKey) mods.push("Ctrl");
        if (e.altKey) mods.push("Alt");
        if (e.shiftKey) mods.push("Shift");
        if (mods.length >= 2) {
          const chordStr = mods.join(" + ");
          setTestDetection(chordStr);
          setTimeout(() => setTestDetection(null), 1200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording]);

  const renderKeycaps = (chordString: string) => {
    const keys = chordString.split("+").map((k) => k.trim());
    return (
      <div className="flex items-center gap-1.5">
        {keys.map((k, idx) => (
          <React.Fragment key={idx}>
            <kbd className="kbd-key px-2.5 py-1 text-xs text-blue-300 font-mono">
              {k}
            </kbd>
            {idx < keys.length - 1 && (
              <span className="text-slate-600 font-bold text-xs">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Keyboard className="w-5 h-5 text-blue-400" />
          Global Keyboard Shortcuts
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure modifier chords for push-to-talk questions and high-speed dictation across any application.
        </p>
      </div>

      {/* European AltGr Notice Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-xs">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-200">
            European Keyboard Layout Advisory (AltGr)
          </div>
          <p className="text-amber-300/80 leading-relaxed">
            On German, French, Polish, and UK Extended keyboards, Windows maps the <code className="text-white font-mono bg-amber-950/60 px-1 py-0.5 rounded">AltGr</code> key to <code className="text-white font-mono bg-amber-950/60 px-1 py-0.5 rounded">Ctrl + Right Alt</code>. If you type special characters like @ or €, use <strong>Left Ctrl + Left Alt</strong> or assign a non-conflicting combo.
          </p>
        </div>
      </div>

      {/* Shortcuts List */}
      <div className="space-y-4">
        {/* Shortcut 1: Push to Talk */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 max-w-sm">
            <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <span>Push-to-Talk Screen Assistance</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Primary
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hold while speaking your question about your screen. Release key to analyze and display guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isRecording === "ask" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500 text-blue-300 text-xs font-mono animate-pulse">
                <span>Press keys: {recordedKeys.length ? recordedKeys.join(" + ") : "..."}</span>
              </div>
            ) : (
              renderKeycaps(askHotkey)
            )}

            <button
              onClick={() => {
                if (isRecording === "ask") {
                  setIsRecording(null);
                  setRecordedKeys([]);
                } else {
                  setIsRecording("ask");
                  setRecordedKeys([]);
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              {isRecording === "ask" ? "Cancel" : "Change"}
            </button>

            {askHotkey !== "Ctrl + Alt" && (
              <button
                onClick={() => setAskHotkey("Ctrl + Alt")}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg transition"
                title="Reset to default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Shortcut 2: Dictation Mode */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 max-w-sm">
            <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <span>Voice Dictation & Paste Mode</span>
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Fast STT
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hold to transcribe your voice directly into the active cursor position. Restores clipboard in 50ms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isRecording === "dictate" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-mono animate-pulse">
                <span>Press keys: {recordedKeys.length ? recordedKeys.join(" + ") : "..."}</span>
              </div>
            ) : (
              renderKeycaps(dictateHotkey)
            )}

            <button
              onClick={() => {
                if (isRecording === "dictate") {
                  setIsRecording(null);
                  setRecordedKeys([]);
                } else {
                  setIsRecording("dictate");
                  setRecordedKeys([]);
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              {isRecording === "dictate" ? "Cancel" : "Change"}
            </button>

            {dictateHotkey !== "Ctrl + Alt + Shift" && (
              <button
                onClick={() => setDictateHotkey("Ctrl + Alt + Shift")}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg transition"
                title="Reset to default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Shortcut 3: Dismiss Overlays */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <div className="font-semibold text-sm text-slate-100">Dismiss Overlay Annotations</div>
            <p className="text-xs text-slate-400">
              Instantly clears all visual marks and halts active spoken audio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="kbd-key px-3 py-1 text-xs text-slate-300 font-mono">Esc</kbd>
            <span className="text-[11px] text-slate-500">Fixed</span>
          </div>
        </div>
      </div>

      {/* Live Shortcut Test Sandbox */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Interactive Shortcut Test Area</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Global Listener Active</span>
        </div>

        <p className="text-xs text-slate-400">
          Try pressing your modifier keys right now to test real-time detection:
        </p>

        <div className="h-14 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center transition-all">
          {testDetection ? (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-4 h-4" />
              <span>Detected: {testDetection}</span>
            </div>
          ) : (
            <span className="text-slate-600 text-xs font-mono">
              [Press Ctrl + Alt on your keyboard]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
