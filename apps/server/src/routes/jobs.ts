//! Background Task Workflows & Asynchronous Job Runner

import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";

export const jobsRoute = new Hono();

jobsRoute.use("*", authMiddleware);

export const CreateJobSchema = z.object({
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(4000),
  type: z.enum(["research", "document_summary", "file_organize"]),
});

export interface JobRecord {
  id: string;
  user_id: string;
  title: string;
  type: "research" | "document_summary" | "file_organize";
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
  created_at: string;
  completed_at?: string;
}

const jobsDatabase = new Map<string, JobRecord>();

/**
 * POST /jobs - Create and enqueue a background task
 */
jobsRoute.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);

  const parsed = CreateJobSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid job payload", details: parsed.error.format() }, 400);
  }

  const { title, prompt, type } = parsed.data;
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const job: JobRecord = {
    id: jobId,
    user_id: user.id,
    title,
    type,
    status: "running",
    created_at: new Date().toISOString(),
  };

  jobsDatabase.set(jobId, job);

  // Simulate background asynchronous completion
  setTimeout(() => {
    const existing = jobsDatabase.get(jobId);
    if (existing) {
      existing.status = "completed";
      existing.result = `Successfully finished ${type} task for "${title}". Executed analysis on: "${prompt.slice(0, 80)}..."`;
      existing.completed_at = new Date().toISOString();
      jobsDatabase.set(jobId, existing);
    }
  }, 100);

  return c.json({ job_id: jobId, status: "running" }, 202);
});

/**
 * GET /jobs/:id - Query background job status
 */
jobsRoute.get("/:id", (c) => {
  const user = c.get("user");
  const jobId = c.req.param("id");

  const job = jobsDatabase.get(jobId);
  if (!job || job.user_id !== user.id) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json(job, 200);
});

/**
 * GET /jobs - List recent background jobs for authenticated user
 */
jobsRoute.get("/", (c) => {
  const user = c.get("user");
  const userJobs = Array.from(jobsDatabase.values())
    .filter((j) => j.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return c.json({ jobs: userJobs }, 200);
});
