import { MailService } from "@/src/services/mail/sendMail"
import { eventsList } from "@/src/services/queue/eventsList"
import { Queue } from "quirrel/next-app"

export const POST = Queue(
  "api/queues/email",
  async (job: { sendingTo: string[]; event: string; payload: any }) => {
    const handler = eventsList[job.event]

    if (!handler) {
      console.error(`No handler found for event: ${job.event}`)
      return
    }

    await handler(job)
  }
)
