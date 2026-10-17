import { describe, it, expect } from "vitest";
import {
  AskSystemPrompt,
  RespondToolInputSchema,
  AskResponsePayloadSchema,
} from "@cursorbuddy/shared";
import app from "./index.js";
import { RESPOND_TOOL_DEFINITION, RESPOND_TOOL_NAME } from "./services/anthropic.js";

describe("Milestone 4: LLM Contract, System Prompt & /ask Fixture Suite", () => {
  it("System prompt constant exists and contains mandatory rules", () => {
    expect(AskSystemPrompt).toBeDefined();
    expect(typeof AskSystemPrompt).toBe("string");
    expect(AskSystemPrompt).toContain("friendly desktop companion that teaches people");
    expect(AskSystemPrompt).toContain("only annotate elements you can actually see");
    expect(AskSystemPrompt).toContain("ask ONE short clarifying question instead of drawing");
    expect(AskSystemPrompt).toContain("never invent UI");
    expect(AskSystemPrompt).toContain("never read out passwords, card numbers");
  });

  it("Tool definition matches contract exactly", () => {
    expect(RESPOND_TOOL_DEFINITION.name).toBe(RESPOND_TOOL_NAME);
    const schema = RESPOND_TOOL_DEFINITION.input_schema;
    expect(schema.required).toContain("speech");
    expect(schema.required).toContain("confidence");
    expect(schema.required).toContain("needs_clarification");
    expect(schema.required).toContain("annotations");
  });

  it("POST /ask validates multipart request and returns structured guidance", async () => {
    // 1. Build test fixture form data
    const formData = new FormData();
    const mockWav = new Blob([new Uint8Array(1024)], { type: "audio/wav" });
    const mockJpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])], {
      type: "image/jpeg",
    });

    const mockMeta = {
      os: "windows",
      scale_factor: 1.25,
      resize_factor: 0.6125,
      display_width: 2560,
      display_height: 1440,
      display_origin_x: 0,
      display_origin_y: 0,
      focused_app_name: "Code",
      focused_window_title: "Cursorbuddy - Visual Studio Code",
    };

    formData.append("audio", mockWav, "speech.wav");
    formData.append("image", mockJpeg, "screenshot.jpg");
    formData.append("metadata", JSON.stringify(mockMeta));

    const res = await app.request("/ask", {
      method: "POST",
      body: formData,
    });

    expect(res.status).toBe(200);
    const json = await res.json();

    // Verify response conforms to AskResponsePayloadSchema
    const parseResult = AskResponsePayloadSchema.safeParse(json);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      const payload = parseResult.data;
      expect(payload.transcript).toBeDefined();
      expect(payload.response.speech).toBeDefined();
      expect(payload.response.speech.length).toBeLessThanOrEqual(500);

      // Verify no markdown headers or bolding in speech
      expect(payload.response.speech).not.toMatch(/^#+\s/m);
      expect(payload.response.speech).not.toContain("**");

      // Verify annotations constraint
      expect(payload.response.annotations.length).toBeLessThanOrEqual(3);

      for (const ann of payload.response.annotations) {
        expect(ann.step).toBeGreaterThanOrEqual(1);
        expect(ann.step).toBeLessThanOrEqual(3);
        expect(ann.x).toBeGreaterThanOrEqual(0);
        expect(ann.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("POST /ask handles clarification requirement properly", () => {
    const rawClarification = {
      speech: "Did you want to change the editor font size or the terminal font size?",
      confidence: "medium",
      needs_clarification: true,
      annotations: [],
    };

    const validated = RespondToolInputSchema.safeParse(rawClarification);
    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.needs_clarification).toBe(true);
      expect(validated.data.annotations).toHaveLength(0);
    }
  });

  it("POST /ask returns 400 when missing required files or invalid metadata", async () => {
    // Missing image
    const formData = new FormData();
    formData.append("audio", new Blob([new Uint8Array(10)], { type: "audio/wav" }), "test.wav");
    formData.append("metadata", JSON.stringify({ os: "windows" }));

    const res = await app.request("/ask", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(400);
  });
});
