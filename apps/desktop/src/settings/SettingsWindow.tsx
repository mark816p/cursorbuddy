import React, { useState } from "react";
import {
  Sliders,
  Keyboard,
  Shield,
  User,
  Bug,
  Volume2,
  VolumeX,
  Sparkles,
  Power,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { HotkeyConfig } from "./HotkeyConfig.js";
import { BlocklistConfig } from "./BlocklistConfig.js";
import { DebugPanel } from "./DebugPanel.js";
import { AccountTab } from "./AccountTab.js";

type TabId = "general" | "hotkeys" | "privacy" | "account" | "debug";

export const SettingsWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [mascotScale, setMascotScale] = useState(100);
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDisplayMode, setSelectedDisplayMode] = useState<"cursor" | "primary">("cursor");
  const [speechSpeed, setSpeechSpeed] = useState<"normal" | "fast">("normal");

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* App Header & Brand */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
                  CB
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
                  }`}
                  title={isPaused ? "Companion Paused" : "Companion Active"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h1 className="font-bold text-sm text-white tracking-tight leading-none">
                    Cursorbuddy
                  </h1>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    v0.1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-1">
                  AI Desktop Companion
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3">
            <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-3 py-1.5">
              Preferences
            </div>
            <nav className="space-y-1">
              {[
                { id: "general", label: "General & Audio", icon: Sliders, badge: null },
                { id: "hotkeys", label: "Global Hotkeys", icon: Keyboard, badge: "Ctrl+Alt" },
                { id: "privacy", label: "Privacy & Redaction", icon: Shield, badge: "Active" },
                { id: "account", label: "Account & Plan", icon: User, badge: null },
                { id: "debug", label: "Diagnostics & DPI", icon: Bug, badge: null },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-blue-700/80 text-blue-100"
                            : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Global Pause & System Status Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${isPaused ? "text-amber-400" : "text-emerald-400"}`} />
              System Status
            </span>
            <span className={`font-semibold ${isPaused ? "text-amber-400" : "text-emerald-400"}`}>
              {isPaused ? "Paused" : "Active"}
            </span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isPaused
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                : "bg-slate-800/90 text-slate-200 hover:bg-slate-800 border border-slate-700/60 hover:text-white"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isPaused ? "Resume Companion" : "Pause Companion"}
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <a
              href="https://mark816p.github.io/cursorbuddy/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 inline-flex items-center gap-1 transition"
            >
              Docs & Help <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </aside>

      {/* Main Settings Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950/95 overflow-hidden">
        {/* Top Window Header Bar */}
        <div className="h-14 px-8 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Cursorbuddy</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-200 font-medium capitalize">
              {activeTab === "general" && "General & Audio Preferences"}
              {activeTab === "hotkeys" && "Global Keyboard Shortcuts"}
              {activeTab === "privacy" && "Privacy & On-Device Redaction"}
              {activeTab === "account" && "Subscription & Quota Management"}
              {activeTab === "debug" && "System Diagnostics & Coordinate Engine"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero-Disk RAM Ephemeral</span>
            </div>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto pb-12">
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <Sliders className="w-5 h-5 text-blue-400" />
                    General & Audio Preferences
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Control voice playback volume, mascot avatar dimensions, and operating system startup behavior.
                  </p>
                </div>

                {/* Audio Output Section */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-blue-400" />
                        )}
                        Companion Spoken Voice Volume
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Controls the ElevenLabs / OpenAI high-speed speech playback volume.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          isMuted
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        {isMuted ? "Unmute" : "Mute"}
                      </button>
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                        {isMuted ? "0%" : `${volume}%`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      disabled={isMuted}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Quiet (0%)</span>
                      <span>Balanced (50%)</span>
                      <span>Maximum (100%)</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Speech Pace</span>
                      <p className="text-[11px] text-slate-400">
                        Adjust playback speed for faster task navigation.
                      </p>
                    </div>
                    <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
                      <button
                        onClick={() => setSpeechSpeed("normal")}
                        className={`px-3 py-1 rounded-md transition ${
                          speechSpeed === "normal"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Normal (1.0x)
                      </button>
                      <button
                        onClick={() => setSpeechSpeed("fast")}
                        className={`px-3 py-1 rounded-md transition ${
                          speechSpeed === "fast"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Snappy (1.25x)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mascot Avatar Scale */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Mascot Avatar Size
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Adjust the scale of the floating companion following your cursor.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                      {mascotScale}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={mascotScale}
                    onChange={(e) => setMascotScale(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Target Display Detection Mode */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-teal-400" />
                      Multi-Monitor Capture Target
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Determine which display is captured when the push-to-talk hotkey is released.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => setSelectedDisplayMode("cursor")}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        selectedDisplayMode === "cursor"
                          ? "bg-blue-600/10 border-blue-500/40 text-blue-300 ring-1 ring-blue-500/20"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-200">Display Under Cursor (Recommended)</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Dynamically captures the screen where your mouse pointer is actively situated.
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedDisplayMode("primary")}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        selectedDisplayMode === "primary"
                          ? "bg-blue-600/10 border-blue-500/40 text-blue-300 ring-1 ring-blue-500/20"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-200">Primary Display Always</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Locks screen analysis strictly to Monitor 1 regardless of cursor position.
                      </div>
                    </button>
                  </div>
                </div>

                {/* System Startup Toggle */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">Launch on Windows Startup</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Start Cursorbuddy minimized in your system tray when you log in.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={launchAtLogin}
                      onChange={(e) => setLaunchAtLogin(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "hotkeys" && <HotkeyConfig />}
            {activeTab === "privacy" && <BlocklistConfig />}
            {activeTab === "debug" && <DebugPanel />}
            {activeTab === "account" && <AccountTab />}
          </div>
        </div>
      </main>
    </div>
  );
};
