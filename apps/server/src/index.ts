import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import dotenv from "dotenv";

import { askRoute } from "./routes/ask.js";
import { ttsRoute } from "./routes/tts.js";
import { dictateRoute } from "./routes/dictate.js";
import { billingRoute } from "./routes/billing.js";
import { webhooksRoute } from "./routes/webhooks.js";
import { invitesRoute } from "./routes/invites.js";
import { jobsRoute } from "./routes/jobs.js";

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

app.route("/ask", askRoute);
app.route("/tts", ttsRoute);
app.route("/dictate", dictateRoute);
app.route("/billing", billingRoute);
app.route("/webhooks", webhooksRoute);
app.route("/invites", invitesRoute);
app.route("/jobs", jobsRoute);

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
