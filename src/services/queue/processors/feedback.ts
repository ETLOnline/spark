import { MailService } from "@/src/services/mail/sendMail"
import { getEmailTemplateByName } from "@/src/db/data-access/emails/query"
import Handlebars from "handlebars"

const mailer = new MailService()

async function sendEmailToRecipient({
  to,
  subject,
  body
}: {
  to: string
  subject: string
  body: string
}) {
  await mailer.sendEmail({
    to,
    from: process.env.EMAIL_FROM_ADDRESS!,
    subject,
    body
  })
}

export async function processFeedbackSubmittedNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  const template = await getEmailTemplateByName("feedback_submitted")
  if (!template) throw new Error(`Template not found: feedback_submitted`)

  const compiledBody = Handlebars.compile(template.body)
  const renderedBody = compiledBody(job.payload)

  const compiledSubject = Handlebars.compile(template.subject)
  const renderedSubject = compiledSubject(job.payload)

  for (const to of job.sendingTo) {
    await sendEmailToRecipient({
      to,
      subject: renderedSubject,
      body: renderedBody
    })
  }
}

export async function processNewFeedbackAdminNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  const template = await getEmailTemplateByName("new_feedback_admin")
  if (!template) throw new Error(`Template not found: new_feedback_admin`)

  const compiledBody = Handlebars.compile(template.body)
  const renderedBody = compiledBody(job.payload)

  const compiledSubject = Handlebars.compile(template.subject)
  const renderedSubject = compiledSubject(job.payload)

  for (const to of job.sendingTo) {
    await sendEmailToRecipient({
      to,
      subject: renderedSubject,
      body: renderedBody
    })
  }
}
