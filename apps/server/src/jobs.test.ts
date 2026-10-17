import { describe, it, expect } from "vitest";
import app from "./index.js";

describe("Milestone 9: Background Task Workflows", () => {
  it("POST /jobs enqueues a background job and returns running status", async () => {
    const res = await app.request("/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Summarize Quarterly Financial PDF",
        prompt: "Extract the top 3 revenue streams and summary bullet points.",
        type: "document_summary",
      }),
    });

    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json.job_id).toBeDefined();
    expect(json.status).toBe("running");

    // Poll for status
    await new Promise((resolve) => setTimeout(resolve, 150));

    const pollRes = await app.request(`/jobs/${json.job_id}`);
    expect(pollRes.status).toBe(200);
    const pollJson = await pollRes.json();
    expect(pollJson.status).toBe("completed");
    expect(pollJson.result).toContain("Successfully finished document_summary task");
    expect(pollJson.completed_at).toBeDefined();
  });

  it("POST /jobs rejects invalid payload", async () => {
    const res = await app.request("/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "",
        type: "invalid_type",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("GET /jobs lists jobs belonging to current user", async () => {
    const res = await app.request("/jobs");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.jobs)).toBe(true);
    expect(json.jobs.length).toBeGreaterThan(0);
  });
});
