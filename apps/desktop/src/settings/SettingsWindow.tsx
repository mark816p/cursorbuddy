import React, { useState } from "react";
import {
  Sliders,
  Keyboard,
  Shield,
  User,
  Bug,
  Volume2,
  Sparkles,
  Power,
} from "lucide-react";
import { HotkeyConfig } from "./HotkeyConfig.js";
import { BlocklistConfig } from "./BlocklistConfig.js";
import { DebugPanel } from "./DebugPanel.js";
import { AccountTab } from "./AccountTab.js";

type TabId = "general" | "hotkeys" | "privacy" | "account" | "debug";

export const SettingsWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [volume, setVolume] = useState(80);
  const [mascotScale, setMascotScale] = useState(100);
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans select-none">
      {/* Sidebar Navigation */}
      <aside className="w-56 bg-slate-900/70 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              CB
            </div>
            <div>
              <div className="font-semibold text-sm leading-none text-white">Cursorbuddy</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Desktop Companion v0.1.0</div>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === "general"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Sliders className="w-4 h-4" />
              General
            </button>

            <button
              onClick={() => setActiveTab("hotkeys")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === "hotkeys"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Hotkeys
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Shield className="w-4 h-4" />
              Privacy & Redaction
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === "account"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <User className="w-4 h-4" />
              Account & Plan
            </button>

            <button
              onClick={() => setActiveTab("debug")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === "debug"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Bug className="w-4 h-4" />
              Diagnostics
            </button>
          </nav>
        </div>

        {/* Global Pause Control */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
              isPaused
                ? "bg-amber-600/20 text-amber-300 border border-amber-600/40 hover:bg-amber-600/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isPaused ? "Companion Paused" : "Companion Active"}
          </button>
        </div>
      </aside>

      {/* Main Settings Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  General Preferences
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Configure voice playback, companion appearance, and system startup.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-medium text-slate-200 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      Spoken Voice Volume
                    </span>
                    <span className="text-blue-400 font-mono">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="flex justify-between text-sm font-medium text-slate-200 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-400" />
                      Mascot Scale
                    </span>
                    <span className="text-blue-400 font-mono">{mascotScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="150"
                    value={mascotScale}
                    onChange={(e) => setMascotScale(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Launch on System Startup</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Start Cursorbuddy automatically minimized to tray when Windows starts.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={launchAtLogin}
                    onChange={(e) => setLaunchAtLogin(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "hotkeys" && <HotkeyConfig />}
          {activeTab === "privacy" && <BlocklistConfig />}
          {activeTab === "debug" && <DebugPanel />}
          {activeTab === "account" && <AccountTab />}
        </div>
      </main>
    </div>
  );
};
