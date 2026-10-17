import React, { useState } from "react";
import { Shield, Lock, EyeOff, Plus, Trash2 } from "lucide-react";

export const BlocklistConfig: React.FC = () => {
  const [customRules, setCustomRules] = useState<string[]>([
    "KeePassXC",
    "TradingView",
    "QuickBooks",
  ]);
  const [newRule, setNewRule] = useState("");

  const addRule = () => {
    if (newRule.trim() && !customRules.includes(newRule.trim())) {
      setCustomRules([...customRules, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (rule: string) => {
    setCustomRules(customRules.filter((r) => r !== rule));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Privacy & Screen Redaction
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Cursorbuddy automatically blacks out sensitive windows before any image leaves your
          device.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          Built-in Automatic Redactions (Always Enforced)
        </div>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>
            <strong className="text-slate-300">Password Managers:</strong> 1Password, Bitwarden,
            KeePass, LastPass, Dashlane, Enpass, Proton Pass.
          </li>
          <li>
            <strong className="text-slate-300">Financial & Banking:</strong> Windows with titles
            matching banking or payment keywords.
          </li>
          <li>
            <strong className="text-slate-300">Private Browsing:</strong> Chrome Incognito, Edge
            InPrivate, Firefox Private Browsing, Safari Private.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-blue-400" />
          User-Defined Redaction Rules (Window Title or Process Name)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
            placeholder="e.g. Confidential, Slack, Outlook..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addRule}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg divide-y divide-slate-800 max-h-48 overflow-y-auto">
          {customRules.map((rule) => (
            <div key={rule} className="p-2.5 flex justify-between items-center text-sm">
              <span className="font-mono text-slate-300">{rule}</span>
              <button
                onClick={() => removeRule(rule)}
                className="text-slate-500 hover:text-red-400 transition p-1"
                title="Remove rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {customRules.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              No custom rules configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
