//! Anthropic Claude Vision Service with Forced Tool Use & Zod Validation
//!
//! Evaluates the screen and spoken question, returning validated annotations and speech.

import Anthropic from "@anthropic-ai/sdk";
import {
  AskMetadata,
  AskSystemPrompt,
  RespondToolInput,
  RespondToolInputSchema,
} from "@cursorbuddy/shared";

export { AskSystemPrompt };

export const RESPOND_TOOL_NAME = "respond";

export const RESPOND_TOOL_DEFINITION: Anthropic.Tool = {
  name: RESPOND_TOOL_NAME,
  description:
    "Respond to the user with spoken teaching guidance and visual SVG annotations pointing to the next step.",
  input_schema: {
    type: "object",
    properties: {
      speech: {
        type: "string",
        description:
          "Maximum 3 short conversational sentences explaining the next step and why. No markdown formatting.",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "Confidence in element localization.",
      },
      needs_clarification: {
        type: "boolean",
        description:
          "Set to true if user question is ambiguous or target element is not found on screen.",
      },
      annotations: {
        type: "array",
        maxItems: 3,
        description: "Visual marks showing where to click. Max 3 annotations.",
        items: {
          type: "object",
          properties: {
            step: { type: "integer", minimum: 1, maximum: 3 },
            type: { type: "string", enum: ["circle", "arrow", "highlight", "note"] },
            x: { type: "integer" },
            y: { type: "integer" },
            w: { type: "integer" },
            h: { type: "integer" },
            from_x: { type: "integer" },
            from_y: { type: "integer" },
            to_x: { type: "integer" },
            to_y: { type: "integer" },
            label: { type: "string", description: "Short callout label (<= 6 words)" },
            element_id: { type: "string" },
          },
          required: ["step", "type", "x", "y", "w", "h"],
        },
      },
    },
    required: ["speech", "confidence", "needs_clarification", "annotations"],
  },
};

export class VisionLlmService {
  private client: Anthropic | null = null;
  private model: string;

  constructor() {
    this.model = process.env.LLM_MODEL || "claude-sonnet-5-5";
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * Main query loop: STT transcript + JPEG image buffer + Display geometry metadata.
   */
  async evaluateScreenQuestion(
    transcript: string,
    imageJpegBuffer: Buffer,
    metadata: AskMetadata
  ): Promise<RespondToolInput> {
    if (!this.client) {
      // Mock fallback for test suites or offline operation
      if (process.env.NODE_ENV === "test" || !process.env.ANTHROPIC_API_KEY) {
        return {
          speech: "To change the font size, click on the File menu in the top left, then select Preferences and Settings.",
          confidence: "high",
          needs_clarification: false,
          annotations: [
            {
              step: 1,
              type: "circle",
              x: 100,
              y: 50,
              w: 48,
              h: 32,
              label: "Click File",
            },
          ],
        };
      }
      throw new Error("Anthropic API key not configured");
    }

    const imageBase64 = imageJpegBuffer.toString("base64");

    const userPrompt = [
      `User Question: "${transcript}"`,
      `Display Geometry: ${metadata.display_width}x${metadata.display_height} physical px, OS: ${metadata.os}`,
      metadata.focused_app_name ? `Focused Application: ${metadata.focused_app_name}` : "",
      metadata.ui_elements && metadata.ui_elements.length > 0
        ? `Known Interactive UI Elements:\n${JSON.stringify(metadata.ui_elements.slice(0, 30))}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: userPrompt,
          },
        ],
      },
    ];

    // Initial Claude call with forced respond tool
    const firstResponse = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: AskSystemPrompt,
      tools: [RESPOND_TOOL_DEFINITION],
      tool_choice: { type: "tool", name: RESPOND_TOOL_NAME },
      messages,
    });

    const toolUse = firstResponse.content.find((c) => c.type === "tool_use");

    if (toolUse && toolUse.name === RESPOND_TOOL_NAME) {
      const parsed = RespondToolInputSchema.safeParse(toolUse.input);
      if (parsed.success) {
        return this.sanitizeResponse(parsed.data);
      }

      // Retry once appending the specific Zod validation error
      tracingError("Zod schema validation failed on first attempt, retrying:", parsed.error);

      const retryMessages: Anthropic.MessageParam[] = [
        ...messages,
        {
          role: "assistant",
          content: firstResponse.content,
        },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              is_error: true,
              content: `Schema validation failed: ${parsed.error.message}. Please correct your response according to the schema.`,
            },
          ],
        },
      ];

      try {
        const retryResponse = await this.client.messages.create({
          model: this.model,
          max_tokens: 1024,
          system: AskSystemPrompt,
          tools: [RESPOND_TOOL_DEFINITION],
          tool_choice: { type: "tool", name: RESPOND_TOOL_NAME },
          messages: retryMessages,
        });

        const retryToolUse = retryResponse.content.find((c) => c.type === "tool_use");
        if (retryToolUse && retryToolUse.name === RESPOND_TOOL_NAME) {
          const retryParsed = RespondToolInputSchema.safeParse(retryToolUse.input);
          if (retryParsed.success) {
            return this.sanitizeResponse(retryParsed.data);
          }
        }
      } catch (retryErr) {
        tracingError("Retry call failed:", retryErr);
      }
    }

    // Graceful fallback to speech-only response
    return {
      speech:
        "I see your screen, but I'm having trouble identifying the exact control. Could you clarify what you'd like to do?",
      confidence: "low",
      needs_clarification: true,
      annotations: [],
    };
  }

  private sanitizeResponse(data: RespondToolInput): RespondToolInput {
    // If needs clarification, clear annotations per contract
    if (data.needs_clarification) {
      return {
        ...data,
        annotations: [],
      };
    }
    return data;
  }
}

function tracingError(msg: string, err: unknown) {
  console.error(`[VisionLlmService] ${msg}`, err);
}

export const visionLlmService = new VisionLlmService();
