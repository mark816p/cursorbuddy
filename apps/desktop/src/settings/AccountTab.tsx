import React, { useState } from "react";
import { User, Gift, CheckCircle, ExternalLink, Zap, Shield } from "lucide-react";

export const AccountTab: React.FC = () => {
  const [plan] = useState<"free" | "pro">("free");
  const [questionsUsed] = useState<number>(14);
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
        setInviteSuccessMsg("Code redeemed successfully! +50 bonus questions added to your account.");
        setInviteCode("");
      } else {
        setInviteErrorMsg("Invalid or expired invite code. Please verify your code.");
      }
    } catch {
      setInviteErrorMsg("Failed to reach verification server. Please retry.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const percentageUsed = Math.min(100, Math.round((questionsUsed / questionsLimit) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-5 h-5 text-blue-400" />
          Account & Quota Management
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your monthly inference usage, upgrade to unlimited priority inference, or redeem promo invite codes.
        </p>
      </div>

      {/* Plan Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                {plan === "pro" ? "Pro Plan" : "Free Community Plan"}
              </span>
              <span className="text-xs text-slate-400">• Active</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {plan === "pro" ? "Cursorbuddy Pro" : "Free Plan Tier"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {plan === "pro"
                ? "2,000 asks / month, priority Claude Opus 5.5 inference & high-speed ElevenLabs TTS."
                : "50 asks / month, standard Claude inference, zero-disk RAM privacy guarantee."}
            </p>
          </div>

          {plan === "free" && (
            <a
              href="https://mark816p.github.io/cursorbuddy/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Upgrade to Pro ($19/mo)</span>
            </a>
          )}
        </div>

        {/* Usage Progress Gauge */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300">Monthly Questions Used</span>
            <span className="font-mono text-slate-200 font-semibold">
              {questionsUsed} / {questionsLimit} <span className="text-slate-500">({percentageUsed}%)</span>
            </span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentageUsed > 85
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : "bg-gradient-to-r from-blue-600 to-teal-400"
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>Resets on the 1st of each month</span>
            <span className="text-slate-400 font-medium font-mono">
              {questionsLimit - questionsUsed} questions remaining
            </span>
          </div>
        </div>
      </div>

      {/* Redeem Promo / Invite Code */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Gift className="w-4 h-4 text-purple-400" />
            <span>Redeem Referral or Promo Code</span>
          </div>
          <span className="text-[11px] text-slate-500">Instant Activation</span>
        </div>

        <p className="text-xs text-slate-400">
          Have an invitation or promotional code? Redeem it here to add bonus asks to your monthly quota.
        </p>

        <form onSubmit={handleRedeemInvite} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. BUDDY50 or EARLYBIRD"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 uppercase"
          />
          <button
            type="submit"
            disabled={isRedeeming || !inviteCode.trim()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            {isRedeeming ? "Redeeming..." : "Redeem Code"}
          </button>
        </form>

        {inviteSuccessMsg && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4" />
            <span>{inviteSuccessMsg}</span>
          </div>
        )}

        {inviteErrorMsg && (
          <div className="text-xs text-rose-400 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            {inviteErrorMsg}
          </div>
        )}
      </div>

      {/* Stripe Portal Link */}
      <div className="text-center pt-2">
        <a
          href="https://mark816p.github.io/cursorbuddy/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition"
        >
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Manage subscription & billing in Stripe Customer Portal</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </div>
    </div>
  );
};
