import React, { useState } from "react";
import {
  Shield,
  Lock,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";

export const BlocklistConfig: React.FC = () => {
  const [customRules, setCustomRules] = useState<string[]>([
    "KeePassXC",
    "TradingView",
    "QuickBooks",
    "Signal",
    "Proton Mail",
  ]);
  const [newRule, setNewRule] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const presets = ["Slack", "Discord", "Telegram", "1Password", "Bitwarden", "Terminal", "Notion"];

  const addRule = (ruleToAdd?: string) => {
    const val = (ruleToAdd || newRule).trim();
    if (val && !customRules.includes(val)) {
      setCustomRules([...customRules, val]);
      if (!ruleToAdd) setNewRule("");
    }
  };

  const removeRule = (rule: string) => {
    setCustomRules(customRules.filter((r) => r !== rule));
  };

  const filteredRules = customRules.filter((r) =>
    r.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          Privacy & On-Device Redaction
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cursorbuddy automatically enumerates visible windows and paints solid blackout rectangles directly on your GPU before any frame leaves your computer.
        </p>
      </div>

      {/* Built-in Protections Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Built-in Automatic Redactions (Always Enforced)</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero-Leak Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <div className="font-semibold text-slate-200">Password Managers</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1Password, Bitwarden, KeePass, LastPass, Dashlane, Enpass, Proton Pass.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <div className="font-semibold text-slate-200">Financial Portals</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Chase, Wells Fargo, Citi, Fidelity, Schwab, PayPal, Revolut, Coinbase.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <div className="font-semibold text-slate-200">Private Browsing</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Chrome Incognito, Edge InPrivate, Firefox Private, Safari Private.
            </p>
          </div>
        </div>
      </div>

      {/* User-Defined Blocklist Rules */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-blue-400" />
              Custom Blackout Rules
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add any window title or process name to obscure before frame downscaling.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {customRules.length} rules active
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
            placeholder="e.g. Confidential, Slack, Outlook, Zoom..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
          />
          <button
            onClick={() => addRule()}
            disabled={!newRule.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        {/* Quick-Add Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-blue-400" /> Quick Add:
          </span>
          {presets.map((preset) => {
            const alreadyAdded = customRules.includes(preset);
            return (
              <button
                key={preset}
                onClick={() => !alreadyAdded && addRule(preset)}
                disabled={alreadyAdded}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                  alreadyAdded
                    ? "bg-slate-900 border-slate-800/60 text-slate-600 cursor-default"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                + {preset}
              </button>
            );
          })}
        </div>

        {/* Search filter if rules > 4 */}
        {customRules.length > 4 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter custom rules..."
              className="w-full bg-slate-950/70 border border-slate-800/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700"
            />
          </div>
        )}

        {/* Rules List */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
          {filteredRules.map((rule) => (
            <div
              key={rule}
              className="p-3 flex justify-between items-center text-xs group hover:bg-slate-900/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono font-medium text-slate-200">{rule}</span>
              </div>
              <button
                onClick={() => removeRule(rule)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition"
                title="Remove rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {filteredRules.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching blackout rules found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
