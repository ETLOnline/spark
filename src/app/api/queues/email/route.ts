import { sendEmail } from "@/src/services/mail/sendMail"
import { Sendgrid } from "@/src/utils/constants"
import { Queue } from "quirrel/next-app"

export const POST = Queue(
  "api/queues/email",

  async (job: { to: string; dynamicTemplateData: any }) => {
    try {
      await sendEmail({
        to: job.to,
        templateId: Sendgrid.SENDGRID_TASK_UPDATE_TEMPLATE_ID as string,
        dynamicTemplateData: job.dynamicTemplateData
      })
    } catch (error) {
      throw error
    }
  }
)
