import { describe, it, expect } from "vitest";
import app from "./index.js";
import { DictateResponseSchema } from "@cursorbuddy/shared";

describe("Milestone 6: Server TTS & Dictation Endpoints", () => {
  it("POST /tts streams audio bytes for valid text payload", async () => {
    const res = await app.request("/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Click on the File menu in the top left, then select Preferences.",
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("audio/mpeg");

    const arrayBuffer = await res.arrayBuffer();
    expect(arrayBuffer.byteLength).toBeGreaterThan(0);
  });

  it("POST /tts returns 400 when text is empty or missing", async () => {
    const res = await app.request("/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "   " }),
    });

    expect(res.status).toBe(400);
  });

  it("POST /dictate accepts WAV audio and returns transcript conforming to DictateResponseSchema", async () => {
    const formData = new FormData();
    const mockWav = new Blob([new Uint8Array(512)], { type: "audio/wav" });
    formData.append("audio", mockWav, "dictation.wav");

    const res = await app.request("/dictate", {
      method: "POST",
      body: formData,
    });

    expect(res.status).toBe(200);
    const json = await res.json();

    const parseResult = DictateResponseSchema.safeParse(json);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      expect(parseResult.data.text).toBeDefined();
      expect(parseResult.data.text.length).toBeGreaterThan(0);
    }
  });

  it("POST /dictate returns 400 when missing audio file", async () => {
    const formData = new FormData();
    const res = await app.request("/dictate", {
      method: "POST",
      body: formData,
    });

    expect(res.status).toBe(400);
  });
});
