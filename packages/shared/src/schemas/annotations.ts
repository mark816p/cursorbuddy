import { z } from "zod";

export const AnnotationTypeSchema = z.enum(["circle", "arrow", "highlight", "note"]);
export type AnnotationType = z.infer<typeof AnnotationTypeSchema>;

export const AnnotationItemSchema = z.object({
  step: z.number().int().min(1).max(3),
  type: AnnotationTypeSchema,
  x: z.number().int(),
  y: z.number().int(),
  w: z.number().int(),
  h: z.number().int(),
  from_x: z.number().int().optional(),
  from_y: z.number().int().optional(),
  to_x: z.number().int().optional(),
  to_y: z.number().int().optional(),
  label: z
    .string()
    .max(60, "Label must be at most 60 characters (approx 6 words)")
    .optional(),
  element_id: z.string().optional(),
});
export type AnnotationItem = z.infer<typeof AnnotationItemSchema>;

export const RespondToolInputSchema = z.object({
  speech: z
    .string()
    .min(1, "Speech cannot be empty")
    .max(500, "Speech must be at most 500 characters (max 3 short conversational sentences)"),
  confidence: z.enum(["high", "medium", "low"]),
  needs_clarification: z.boolean(),
  annotations: z.array(AnnotationItemSchema).max(3, "Maximum 3 annotations per step"),
});
export type RespondToolInput = z.infer<typeof RespondToolInputSchema>;
