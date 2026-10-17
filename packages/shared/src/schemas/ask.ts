import { z } from "zod";
import { RespondToolInputSchema } from "./annotations.js";

export const RectBoundsSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  w: z.number().int(),
  h: z.number().int(),
});
export type RectBounds = z.infer<typeof RectBoundsSchema>;

export const UiElementItemSchema = z.object({
  id: z.string(),
  role: z.string(),
  name: z.string(),
  bounds: RectBoundsSchema,
});
export type UiElementItem = z.infer<typeof UiElementItemSchema>;

export const AskMetadataSchema = z.object({
  os: z.enum(["windows", "macos", "linux"]),
  scale_factor: z.number().positive(),
  resize_factor: z.number().positive(),
  display_width: z.number().int().positive(),
  display_height: z.number().int().positive(),
  display_origin_x: z.number().int(),
  display_origin_y: z.number().int(),
  focused_app_name: z.string().optional(),
  focused_window_title: z.string().optional(),
  focused_window_bounds: RectBoundsSchema.optional(),
  ui_elements: z.array(UiElementItemSchema).optional(),
});
export type AskMetadata = z.infer<typeof AskMetadataSchema>;

export const AskResponsePayloadSchema = z.object({
  transcript: z.string(),
  response: RespondToolInputSchema,
  tts_stream_url: z.string().optional(),
  tts_audio_base64: z.string().optional(),
});
export type AskResponsePayload = z.infer<typeof AskResponsePayloadSchema>;

export const AskSystemPrompt =
  `You are a friendly desktop companion that teaches people to do things themselves. You get a screenshot and a spoken question. Identify the exact control, menu, setting or area needed and point to it. Rules: only annotate elements you can actually see; if unsure which control is meant, ask ONE short clarifying question instead of drawing; if confidence is low, say so out loud ('I think it's this one, but I'm not sure'); give one step at a time, at most 3 annotations; briefly say why so the user can repeat it without you; never invent UI; never read out passwords, card numbers or other sensitive data visible on screen.`;
