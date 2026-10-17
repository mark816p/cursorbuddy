//! Stripe Billing Routes: Checkout, Customer Portal & Usage

import { Hono } from "hono";
import Stripe from "stripe";
import { authMiddleware } from "../middleware/auth.js";
import { getUserUsage } from "../middleware/quota.js";

export const billingRoute = new Hono();

const stripeApiKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeApiKey ? new Stripe(stripeApiKey) : null;

// Require authentication for all billing operations
billingRoute.use("*", authMiddleware);

/**
 * GET /billing/usage - Return authenticated user's current quota usage
 */
billingRoute.get("/usage", (c) => {
  const user = c.get("user");
  const usage = getUserUsage(user.id, user.plan);

  return c.json({
    user_id: user.id,
    plan: user.plan,
    questions_used: usage.questions,
    questions_limit: usage.limit,
    bonus_questions: usage.bonus,
    resets_in_days: 14,
  });
});

/**
 * POST /billing/checkout - Create Stripe Checkout Session for Pro plan ($19/mo)
 */
billingRoute.post("/checkout", async (c) => {
  const user = c.get("user");

  if (!stripe) {
    // Mock checkout URL for development/testing
    return c.json({
      url: `https://checkout.stripe.com/c/pay/cs_test_mock_${user.id}`,
      session_id: `cs_test_mock_${user.id}`,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: "https://cursorbuddy.ai/app/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://cursorbuddy.ai/app/canceled",
    });

    return c.json({ url: session.url, session_id: session.id });
  } catch (err: unknown) {
    console.error("[Billing Checkout Error]:", err);
    const message = err instanceof Error ? err.message : "Stripe checkout session failed";
    return c.json({ error: "Failed to create checkout session", message }, 500);
  }
});

/**
 * POST /billing/portal - Create Stripe Customer Portal session
 */
billingRoute.post("/portal", async (c) => {
  const user = c.get("user");

  if (!stripe) {
    return c.json({
      url: `https://billing.stripe.com/p/session/test_portal_${user.id}`,
    });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: `cus_${user.id}`,
      return_url: "https://cursorbuddy.ai/app/settings",
    });

    return c.json({ url: portalSession.url });
  } catch (err: unknown) {
    console.error("[Billing Portal Error]:", err);
    return c.json({ error: "Failed to create customer portal session" }, 500);
  }
});
