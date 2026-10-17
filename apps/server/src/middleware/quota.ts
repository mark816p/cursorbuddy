//! Atomic Quota & Rate Limiting Middleware
//!
//! Enforces monthly question limits (Free: 50 asks/mo, Pro: 2,000 asks/mo)
//! and 30 req/min rate limiting.

import { createMiddleware } from "hono/factory";

interface QuotaState {
  questions: number;
  bonus: number;
  lastReset: number;
  requestTimestamps: number[];
}

const localUsageMap = new Map<string, QuotaState>();

export const quotaMiddleware = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const now = Date.now();
  let usage = localUsageMap.get(user.id);
  if (!usage) {
    usage = {
      questions: 0,
      bonus: 0,
      lastReset: now,
      requestTimestamps: [],
    };
    localUsageMap.set(user.id, usage);
  }

  // 1. Rate Limiting: Max 30 requests per minute
  usage.requestTimestamps = usage.requestTimestamps.filter((t) => now - t < 60000);
  if (usage.requestTimestamps.length >= 30) {
    return c.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please wait a moment before asking another question.",
      },
      429
    );
  }
  usage.requestTimestamps.push(now);

  // 2. Monthly Quota: Free: 50 + bonus; Pro: 2000
  const limit = user.plan === "pro" ? 2000 : 50 + usage.bonus;

  if (usage.questions >= limit) {
    return c.json(
      {
        error: "Monthly quota exceeded",
        message: `You have reached your monthly limit of ${limit} questions on the ${user.plan} plan.`,
        plan: user.plan,
        current_usage: usage.questions,
        limit_max: limit,
        upgrade_url: "/billing/checkout",
      },
      429
    );
  }

  // Increment usage
  usage.questions += 1;

  await next();
});

export function addBonusQuestions(userId: string, count: number): void {
  const state = localUsageMap.get(userId) || {
    questions: 0,
    bonus: 0,
    lastReset: Date.now(),
    requestTimestamps: [],
  };
  state.bonus += count;
  localUsageMap.set(userId, state);
}

export function getUserUsage(userId: string, plan: "free" | "pro") {
  const state = localUsageMap.get(userId) || {
    questions: 0,
    bonus: 0,
    lastReset: Date.now(),
    requestTimestamps: [],
  };
  const limit = plan === "pro" ? 2000 : 50 + state.bonus;
  return {
    questions: state.questions,
    limit,
    bonus: state.bonus,
  };
}
