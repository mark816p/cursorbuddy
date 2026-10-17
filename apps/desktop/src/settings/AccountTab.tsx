import React, { useState } from "react";
import { User, Gift, CheckCircle, ExternalLink, Zap } from "lucide-react";

export const AccountTab: React.FC = () => {
  const [plan] = useState<"free" | "pro">("free");
  const [questionsUsed] = useState<number>(12);
  const [questionsLimit, setQuestionsLimit] = useState<number>(50);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  const handleRedeemInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsRedeeming(true);
    setInviteSuccessMsg(null);
    setInviteErrorMsg(null);

    try {
      const code = inviteCode.trim().toUpperCase();
      if (code === "BUDDY50" || code === "EARLYBIRD" || code.startsWith("PROMO-")) {
        setQuestionsLimit((prev) => prev + 50);
        setInviteSuccessMsg("Success! 50 bonus questions added to your monthly limit.");
        setInviteCode("");
      } else {
        setInviteErrorMsg("Invalid or expired invite code. Please check and try again.");
      }
    } catch {
      setInviteErrorMsg("Failed to connect to account server.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleUpgrade = () => {
    window.open("https://cursorbuddy.ai/pricing", "_blank");
  };

  const percentageUsed = Math.min(100, Math.round((questionsUsed / questionsLimit) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Account & Monthly Quota
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Manage your subscription plan, monitor usage, and redeem bonus invite codes.
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Current Plan
            </span>
            <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
              {plan === "pro" ? "Cursorbuddy Pro" : "Free Tier"}
              {plan === "pro" && (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-normal">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {plan === "pro"
                ? "2,000 asks / month, priority Claude Opus 5.5 inference & high-speed TTS."
                : "50 asks / month, standard speed, community support."}
            </p>
          </div>

          {plan === "free" && (
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Upgrade to Pro ($19/mo)
            </button>
          )}
        </div>

        {/* Usage Progress Bar */}
        <div className="space-y-1.5 pt-3 border-t border-slate-800">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Questions Used this Month</span>
            <span className="font-mono text-slate-200">
              {questionsUsed} / {questionsLimit} ({percentageUsed}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentageUsed > 90 ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>Resets on the 1st of each month</span>
            <span>{questionsLimit - questionsUsed} questions remaining</span>
          </div>
        </div>
      </div>

      {/* Redeem Invite / Referral Code */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Gift className="w-4 h-4 text-purple-400" />
          Redeem Invite or Promo Code
        </div>
        <p className="text-xs text-slate-400">
          Enter an invite code from a friend or promotional campaign to earn extra free questions.
        </p>

        <form onSubmit={handleRedeemInvite} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="e.g. BUDDY50"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 uppercase"
          />
          <button
            type="submit"
            disabled={isRedeeming || !inviteCode.trim()}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
          >
            {isRedeeming ? "Redeeming..." : "Redeem"}
          </button>
        </form>

        {inviteSuccessMsg && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {inviteSuccessMsg}
          </div>
        )}

        {inviteErrorMsg && <div className="text-xs text-rose-400 pt-1">{inviteErrorMsg}</div>}
      </div>

      {/* Customer Portal Link */}
      <div className="text-center pt-2">
        <a
          href="https://cursorbuddy.ai/account"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition"
        >
          Manage billing and invoices in Stripe Customer Portal
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
