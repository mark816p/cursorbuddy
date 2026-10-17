import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow localhost, tauri app, and custom domains
      if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("tauri://")) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "cursorbuddy-server",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

const port = Number(process.env.PORT) || 3001;

// Only listen when executed directly
if (process.env.NODE_ENV !== "test") {
  console.log(`🚀 Cursorbuddy server listening on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
