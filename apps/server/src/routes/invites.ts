//! Invite Code Redemption Route
//!
//! Validates invite/referral codes and credits bonus questions to user quota.

import { Hono } from "hono";
import { RedeemInviteSchema, RedeemInviteResult } from "@cursorbuddy/shared";
import { authMiddleware } from "../middleware/auth.js";
import { addBonusQuestions } from "../middleware/quota.js";

export const invitesRoute = new Hono();

invitesRoute.use("*", authMiddleware);

invitesRoute.post("/redeem", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);

  const parsed = RedeemInviteSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid invite code format", details: parsed.error.format() }, 400);
  }

  const { code } = parsed.data;

  // Validation logic: accept known promo codes or test patterns
  const normalized = code.trim().toUpperCase();
  if (normalized === "BUDDY50" || normalized === "EARLYBIRD" || normalized.startsWith("PROMO-")) {
    const bonus = 50;
    addBonusQuestions(user.id, bonus);

    const result: RedeemInviteResult = {
      success: true,
      bonus_questions: bonus,
      message: `Success! ${bonus} bonus questions added to your account.`,
    };
    return c.json(result, 200);
  }

  return c.json(
    {
      success: false,
      bonus_questions: 0,
      message: "Invalid or expired invite code.",
    },
    400
  );
});
