import { MailService } from "@/src/services/mail/sendMail"
import { getEmailTemplateByName } from "@/src/db/data-access/emails/query"
import Handlebars from "handlebars"

export async function processMentorSessionNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  const mailer = new MailService()
  const template = await getEmailTemplateByName(job.event)
  if (!template) throw new Error(`Template not found: ${job.event}`)

  const compiledBody = Handlebars.compile(template.body)
  const renderedBody = compiledBody(job.payload)

  const compiledSubject = Handlebars.compile(template.subject)
  const renderedSubject = compiledSubject(job.payload)

  await Promise.all(
    job.sendingTo.map((to) =>
      mailer.sendEmail({
        to,
        from: process.env.EMAIL_FROM_ADDRESS!,
        subject: renderedSubject,
        body: renderedBody
      })
    )
  )
}
