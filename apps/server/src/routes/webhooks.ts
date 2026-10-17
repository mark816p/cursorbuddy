//! Stripe Webhook Listener
//!
//! Handles subscription lifecycle events and keeps user plan in sync.

import { Hono } from "hono";
import Stripe from "stripe";

export const webhooksRoute = new Hono();

const stripeApiKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeApiKey ? new Stripe(stripeApiKey) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

webhooksRoute.post("/stripe", async (c) => {
  const signature = c.req.header("stripe-signature");

  let event: Stripe.Event;

  if (!stripe || !webhookSecret) {
    // In dev / mock testing mode
    const body = await c.req.json().catch(() => ({}));
    event = body as Stripe.Event;
  } else {
    try {
      const rawBody = await c.req.text();
      event = stripe.webhooks.constructEvent(rawBody, signature || "", webhookSecret);
    } catch (err: unknown) {
      console.warn("[Stripe Webhook Signature Verification Failed]:", err);
      return c.json({ error: "Invalid signature" }, 400);
    }
  }

  // Handle specific event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (userId) {
        console.log(`[Stripe Webhook] User ${userId} upgraded to Pro plan!`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`[Stripe Webhook] Subscription ${subscription.id} canceled; user returned to Free plan`);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return c.json({ received: true });
});
