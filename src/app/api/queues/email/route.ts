import { Sendgrid } from "@/src/utils/constants"
import { Queue } from "quirrel/next-app"
import { MailService } from "@/src/services/mail/sendMail"
import { getEmailTemplateByName } from "@/src/db/data-access/emails/query"
import Handlebars from "handlebars"

const mailer = new MailService()

export const POST = Queue(
  "api/queues/email",

  async (job: {
    to: string
    dynamicTemplateData: any
    template_name: string
  }) => {
    try {
      const senderEmail = process.env.EMAIL_FROM_ADDRESS

      if (!senderEmail) {
        throw new Error("EMAIL_FROM_ADDRESS environment variable is not set.")
      }
      const emailTemplate = await getEmailTemplateByName(job.template_name)
      if (!emailTemplate) {
        console.error("Template not found:", job.template_name)
        throw new Error(`Email template not found: ${job.template_name}`)
      }

      const templateCompiler = Handlebars.compile(emailTemplate.body)

      const renderedBody = templateCompiler(job.dynamicTemplateData)

      const payload = {
        to: job.to,
        subject: emailTemplate.subject,
        from: senderEmail,
        body: renderedBody
      }
      await mailer.sendEmail(payload)
    } catch (error) {
      throw error
    }
  }
)
