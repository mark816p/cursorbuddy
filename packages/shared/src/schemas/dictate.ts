import { z } from "zod";

export const DictateResponseSchema = z.object({
  text: z.string(),
  language: z.string().optional(),
  duration_seconds: z.number().optional(),
});
export type DictateResponse = z.infer<typeof DictateResponseSchema>;
