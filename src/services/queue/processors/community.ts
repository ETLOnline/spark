import { MailService } from "@/src/services/mail/sendMail"
import { getEmailTemplateByName } from "@/src/db/data-access/emails/query"
import Handlebars from "handlebars"

const mailer = new MailService()
export async function processSubmitCommunityRequestNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  const template = await getEmailTemplateByName(job.event)
  if (!template) throw new Error(`Template not found: ${job.event}`)

  const compiled = Handlebars.compile(template.body)
  const renderedBody = compiled(job.payload)

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
