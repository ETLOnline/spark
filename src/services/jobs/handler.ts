import type { SelectJob } from "@/src/db/schema"
import { handleAddReward, handleCleanupOldJobs } from "./handlers"

/**
 * Central job dispatcher.
 *
 * Add a `case` for each job type using the pattern "<queue>:<name>".
 * Define the handler function below and call it from the switch.
 *
 * Example — enqueue from anywhere:
 *   await enqueue("rewards", "add-reward", { action_type: "post_created", user_id: "123" })
 */
export async function processJob(job: SelectJob) {
  const key = `${job.queue}:${job.name}`
  const payload = job.payload as Record<string, any>

  console.log(`[jobs] Processing: ${key} (id=${job.id})`)

  switch (key) {
    case "rewards:add-reward":
      await handleAddReward(
        payload as {
          action_type: string
          user_id: string
          proof_url?: string
          metadata?: any
          verification_id?: number
          idempotency_field?: string
          idempotency_value?: string
        }
      )
      break

    case "maintenance:cleanup-old-jobs":
      await handleCleanupOldJobs()
      break

    // Catch-all — fail loudly so unregistered jobs don't silently disappear
    default:
      throw new Error(`Unknown job: ${key}`)
  }
}
