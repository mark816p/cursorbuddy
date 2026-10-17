//! Hono Route Handler for POST /tts
//!
//! Accepts { text: string } and streams audio back to the client.

import { Hono } from "hono";
import { ttsService } from "../services/tts.js";

export const ttsRoute = new Hono();

ttsRoute.post("/", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body || typeof body.text !== "string" || body.text.trim().length === 0) {
      return c.json({ error: "Missing or invalid 'text' field in JSON payload" }, 400);
    }

    if (body.text.length > 2000) {
      return c.json({ error: "Text exceeds maximum allowed length of 2000 characters" }, 400);
    }

    const { stream, contentType } = await ttsService.synthesize(body.text.trim());

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    console.error("[/tts] Audio synthesis failed:", err);
    const message = err instanceof Error ? err.message : "Audio synthesis error";
    return c.json({ error: "Internal server error", message }, 500);
  }
});
