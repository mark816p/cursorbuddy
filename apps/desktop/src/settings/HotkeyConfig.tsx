import React, { useState } from "react";
import { AlertTriangle, Keyboard } from "lucide-react";

export const HotkeyConfig: React.FC = () => {
  const [askHotkey, setAskHotkey] = useState("Ctrl+Alt");
  const [dictateHotkey, setDictateHotkey] = useState("Ctrl+Alt+Shift");
  const isWindows = true; // In production read from @tauri-apps/plugin-os

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-blue-400" />
          Global Hotkeys
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Configure modifier chords for push-to-talk questions and dictation mode.
        </p>
      </div>

      {isWindows && (
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-200">
              International Keyboard Layout Notice (AltGr):
            </span>
            <p className="text-amber-300/90 mt-1">
              On German, Polish, and other European keyboards, the <code>AltGr</code> key is mapped
              by Windows to <code>Ctrl + Right Alt</code>. If you frequently use AltGr for special
              characters like @ or €, consider using <strong>Left Ctrl + Left Alt</strong> or
              remapping to a dedicated shortcut.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="font-medium text-slate-200">Push-to-Talk Screen Assistance</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Hold while speaking your question about the screen. Release to analyze.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-blue-300 shadow-inner">
              {askHotkey}
            </kbd>
            <button
              onClick={() => setAskHotkey("Ctrl+Alt")}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="font-medium text-slate-200">Dictation Paste Mode</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Hold to transcribe voice directly into the focused application text field.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-purple-300 shadow-inner">
              {dictateHotkey}
            </kbd>
            <button
              onClick={() => setDictateHotkey("Ctrl+Alt+Shift")}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
