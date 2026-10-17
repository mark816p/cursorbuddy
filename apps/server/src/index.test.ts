import { describe, it, expect } from "vitest";
import app from "./index.js";

describe("Server Base Endpoints", () => {
  it("GET /health returns status ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; service: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("cursorbuddy-server");
  });
});
