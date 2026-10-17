import { z } from "zod";

export const UserPlanSchema = z.enum(["free", "pro"]);
export type UserPlan = z.infer<typeof UserPlanSchema>;

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  plan: UserPlanSchema,
  created_at: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserUsageSchema = z.object({
  user_id: z.string().uuid(),
  month: z.string(), // YYYY-MM
  questions: z.number().int().nonnegative(),
  jobs: z.number().int().nonnegative(),
  questions_limit: z.number().int().positive(),
  jobs_limit: z.number().int().positive(),
});
export type UserUsage = z.infer<typeof UserUsageSchema>;

export const RedeemInviteSchema = z.object({
  code: z.string().min(4).max(32),
});
export type RedeemInvite = z.infer<typeof RedeemInviteSchema>;

export const RedeemInviteResultSchema = z.object({
  success: z.boolean(),
  bonus_questions: z.number().int(),
  message: z.string(),
});
export type RedeemInviteResult = z.infer<typeof RedeemInviteResultSchema>;
