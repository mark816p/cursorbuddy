import { describe, it, expect } from "vitest";
import app from "./index.js";
import { RedeemInviteResultSchema } from "@cursorbuddy/shared";

describe("Milestone 7: Auth, Quotas, Billing & Invites", () => {
  it("GET /billing/usage returns user plan and questions count", async () => {
    const res = await app.request("/billing/usage", {
      method: "GET",
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user_id).toBeDefined();
    expect(json.plan).toBe("free");
    expect(json.questions_limit).toBe(50);
  });

  it("POST /billing/checkout returns checkout session url", async () => {
    const res = await app.request("/billing/checkout", {
      method: "POST",
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toContain("checkout.stripe.com");
    expect(json.session_id).toBeDefined();
  });

  it("POST /invites/redeem credits bonus questions for valid promo code", async () => {
    const res = await app.request("/invites/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "BUDDY50" }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();

    const parseResult = RedeemInviteResultSchema.safeParse(json);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.success).toBe(true);
      expect(parseResult.data.bonus_questions).toBe(50);
    }

    // Verify usage limit increased
    const usageRes = await app.request("/billing/usage");
    const usage = await usageRes.json();
    expect(usage.bonus_questions).toBe(50);
    expect(usage.questions_limit).toBe(100); // 50 base + 50 bonus
  });

  it("POST /invites/redeem rejects invalid codes", async () => {
    const res = await app.request("/invites/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "INVALID_CODE_XYZ" }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /webhooks/stripe accepts subscription event payloads", async () => {
    const mockPayload = {
      id: "evt_test_123",
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: "11111111-1111-1111-1111-111111111111",
          customer: "cus_test_123",
        },
      },
    };

    const res = await app.request("/webhooks/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockPayload),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});
