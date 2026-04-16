import { enqueueCron } from "./queue"

interface CronJobSpec {
  queue: string
  name: string
  payload: object
  intervalMs: number
}

/**
 * Define all recurring jobs here.
 * Each entry is enqueued once on startup and then re-enqueued on its interval.
 * `enqueueCron` is idempotent — it only inserts when no pending copy exists.
 */
const CRON_JOBS: CronJobSpec[] = [
  {
    queue: "maintenance",
    name: "cleanup-old-jobs",
    payload: {},
    intervalMs: 60 * 60 * 1_000 // every 1 hour
  },
  // {
  //   queue: "rewards",
  //   name: "some-reward-job",
  //   payload: {},
  //   intervalMs: 5_000, // every 5 seconds
  // },
  // {
  //   queue: "emails",
  //   name: "daily-digest",
  //   payload: {},
  //   intervalMs: 24 * 60 * 60 * 1_000, // every 24 hours
  // },
]

export function startScheduler() {
  console.log("[jobs] Scheduler started —", CRON_JOBS.length, "recurring job(s)")
  for (const job of CRON_JOBS) {
    scheduleJob(job) // fire once immediately on startup
    setInterval(() => scheduleJob(job), job.intervalMs)
  }
}

async function scheduleJob(job: CronJobSpec) {
  try {
    await enqueueCron(job.queue, job.name, job.payload, new Date())
  } catch (err) {
    console.error(`[jobs] Scheduler failed to enqueue ${job.queue}:${job.name}`, err)
  }
}
