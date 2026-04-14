import { db } from "@/src/db"
import { jobsTable } from "@/src/db/schema"
import { and, eq } from "drizzle-orm"

/**
 * Enqueue a one-off job for immediate or future execution.
 *
 * @param queue   - Logical queue name (e.g. "emails")
 * @param name    - Job type within the queue (e.g. "welcome-email")
 * @param payload - Arbitrary data the handler receives
 * @param runAt   - Optional future date; omit to run as soon as possible
 */
export async function enqueue(
  queue: string,
  name: string,
  payload: object,
  runAt?: Date
) {
  return db.insert(jobsTable).values({
    queue,
    name,
    payload,
    run_at: runAt ?? new Date()
  })
}

/**
 * Enqueue a recurring job only when no pending/running instance already exists.
 * Call this from the scheduler to avoid stacking up duplicate cron jobs.
 */
export async function enqueueCron(
  queue: string,
  name: string,
  payload: object,
  runAt: Date
) {
  const existing = await db.query.jobsTable.findFirst({
    where: and(
      eq(jobsTable.queue, queue),
      eq(jobsTable.name, name),
      eq(jobsTable.status, "pending")
    )
  })

  if (!existing) {
    await enqueue(queue, name, payload, runAt)
  }
}
