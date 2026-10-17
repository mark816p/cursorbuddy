//! Supabase JWT Authentication Middleware via Jose
//!
//! Validates Bearer tokens and extracts user profile info into Hono context.

import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  plan: "free" | "pro";
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthenticatedUser;
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // In test environment or offline dev mode, provide fallback authenticated test user
    if (process.env.NODE_ENV === "test" || !process.env.SUPABASE_JWT_SECRET) {
      c.set("user", {
        id: "11111111-1111-1111-1111-111111111111",
        email: "test@cursorbuddy.ai",
        plan: "free",
      });
      return await next();
    }
    return c.json({ error: "Unauthorized: Missing or malformed Bearer token" }, 401);
  }

  const token = authHeader.substring(7);
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    c.set("user", {
      id: "11111111-1111-1111-1111-111111111111",
      email: "local@cursorbuddy.ai",
      plan: "free",
    });
    return await next();
  }

  try {
    const secretBytes = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretBytes);

    const user: AuthenticatedUser = {
      id: payload.sub as string,
      email: payload.email as string | undefined,
      plan: ((payload.app_metadata as Record<string, unknown>)?.plan as "free" | "pro") || "free",
    };

    c.set("user", user);
    await next();
  } catch (err) {
    console.warn("[AuthMiddleware] JWT verification failed:", err);
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
});
