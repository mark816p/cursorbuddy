//! Hono Route Handler for POST /ask
//!
//! Accepts multipart form (audio WAV + JPEG screenshot + metadata),
//! performs STT, queries Claude with forced tool use, and returns validated guidance.

import { Hono } from "hono";
import {
  AskMetadataSchema,
  AskResponsePayload,
} from "@cursorbuddy/shared";
import { sttService } from "../services/stt.js";
import { visionLlmService } from "../services/anthropic.js";

export const askRoute = new Hono();

askRoute.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();

    // 1. Extract and validate audio file
    const audioFile = body["audio"];
    if (!audioFile || typeof audioFile === "string") {
      return c.json({ error: "Missing or invalid 'audio' file in multipart payload" }, 400);
    }
    const audioBuffer = Buffer.from(await (audioFile as File).arrayBuffer());

    // 2. Extract and validate screenshot JPEG file
    const imageFile = body["image"];
    if (!imageFile || typeof imageFile === "string") {
      return c.json({ error: "Missing or invalid 'image' file in multipart payload" }, 400);
    }
    const imageBuffer = Buffer.from(await (imageFile as File).arrayBuffer());

    // 3. Extract and parse metadata
    const metadataRaw = body["metadata"];
    if (!metadataRaw || typeof metadataRaw !== "string") {
      return c.json({ error: "Missing or invalid 'metadata' string in payload" }, 400);
    }

    let parsedMetaJson: unknown;
    try {
      parsedMetaJson = JSON.parse(metadataRaw);
    } catch {
      return c.json({ error: "Invalid JSON format in 'metadata' field" }, 400);
    }

    const metaResult = AskMetadataSchema.safeParse(parsedMetaJson);
    if (!metaResult.success) {
      return c.json(
        { error: "Metadata validation failed", details: metaResult.error.format() },
        400
      );
    }
    const metadata = metaResult.data;

    // 4. Perform Speech-to-Text
    const transcript = await sttService.transcribe(audioBuffer);

    // 5. Evaluate with Claude Vision LLM
    const response = await visionLlmService.evaluateScreenQuestion(
      transcript,
      imageBuffer,
      metadata
    );

    const payload: AskResponsePayload = {
      transcript,
      response,
    };

    return c.json(payload, 200);
  } catch (err: unknown) {
    console.error("[/ask] Internal server error:", err);
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return c.json({ error: "Internal server error", message }, 500);
  }
});
