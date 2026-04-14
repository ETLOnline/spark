import { db } from "@/src/db"
import { jobsTable } from "@/src/db/schema"
import { and, eq, lt, lte } from "drizzle-orm"
import { processJob } from "./handlers"

const POLL_INTERVAL = 5000 // ms — how often to check for pending jobs

export function startWorker() {
  console.log("[jobs] Worker started — polling every", POLL_INTERVAL, "ms")
  poll()
}

async function poll() {
  try {
    await tick()
  } catch (err) {
    console.error("[jobs] Worker error:", err)
  } finally {
    setTimeout(poll, POLL_INTERVAL)
  }
}

async function tick() {
  // Claim the oldest pending job that is due to run and has retries remaining.
  // For horizontal scaling (multiple server instances), replace this with a
  // transaction using SELECT ... FOR UPDATE SKIP LOCKED to prevent double-processing.
  const [job] = await db
    .select()
    .from(jobsTable)
    .where(
      and(
        eq(jobsTable.status, "pending"),
        lte(jobsTable.run_at, new Date()),
        lt(jobsTable.attempts, jobsTable.max_attempts)
      )
    )
    .orderBy(jobsTable.run_at)
    .limit(1)

  if (!job) return

  // Mark as running to prevent double-processing in a single-instance deployment
  await db
    .update(jobsTable)
    .set({
      status: "running",
      attempts: job.attempts + 1,
      updated_at: new Date()
    })
    .where(eq(jobsTable.id, job.id))

  try {
    await processJob(job)

    await db
      .update(jobsTable)
      .set({ status: "done", updated_at: new Date() })
      .where(eq(jobsTable.id, job.id))

    console.log(`[jobs] Done: ${job.queue}:${job.name} (id=${job.id})`)
  } catch (err: any) {
    const isFailed = job.attempts + 1 >= job.max_attempts

    await db
      .update(jobsTable)
      .set({
        status: isFailed ? "failed" : "pending",
        error: err?.message ?? String(err),
        updated_at: new Date(),
        // Back off 10 s before the next retry; leave run_at unchanged on final failure
        run_at: isFailed ? job.run_at : new Date(Date.now() + 10_000)
      })
      .where(eq(jobsTable.id, job.id))

    console.error(
      `[jobs] ${isFailed ? "Failed" : "Retrying"}: ${job.queue}:${job.name} (id=${job.id}) —`,
      err?.message
    )
  }
}
