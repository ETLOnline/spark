import { sendEmail } from "@/src/services/mail/sendMail"
import { generateTaskUpdateEmailHtml } from "@/src/utils/emailTemplates"
import { Queue } from "quirrel/next-app"

export const POST = Queue(
  "api/queues/email",
  async (job: { to: string; task: any }) => {
    const subject = `Update to Task: ${job.task.title || "Untitled Task"}`
    console.log(job.task, "task")
    const html = generateTaskUpdateEmailHtml(job.task)
    await sendEmail({ to: job.to, subject, html })
  }
)
