//! Hono Route Handler for POST /dictate
//!
//! Accepts multipart audio (WAV), transcribes it via STT, and returns DictateResponse.

import { Hono } from "hono";
import { DictateResponse } from "@cursorbuddy/shared";
import { sttService } from "../services/stt.js";

export const dictateRoute = new Hono();

dictateRoute.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();

    const audioFile = body["audio"];
    if (!audioFile || typeof audioFile === "string") {
      return c.json({ error: "Missing or invalid 'audio' file in multipart payload" }, 400);
    }

    const audioBuffer = Buffer.from(await (audioFile as File).arrayBuffer());
    if (audioBuffer.length === 0) {
      return c.json({ error: "Audio buffer cannot be empty" }, 400);
    }

    const transcript = await sttService.transcribe(audioBuffer);

    const response: DictateResponse = {
      text: transcript,
      language: "en",
    };

    return c.json(response, 200);
  } catch (err: unknown) {
    console.error("[/dictate] Transcription error:", err);
    const message = err instanceof Error ? err.message : "Transcription failed";
    return c.json({ error: "Internal server error", message }, 500);
  }
});
