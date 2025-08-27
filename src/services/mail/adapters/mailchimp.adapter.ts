import mailchimp from "@mailchimp/mailchimp_transactional"
import { MailAdapter, MailPayload } from "../types/interface"

const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY!)

export class MailchimpAdapter implements MailAdapter {
  async sendMail(payload: MailPayload): Promise<void> {
    const message = {
      from_email: payload.from,
      from_name: "ETL Online",
      subject: payload.subject,
      html: payload.body,
      to: [{ email: payload.to, type: "to" }]
    }
    try {
      const result = await mailchimpClient.messages.send({ message })
      console.log(`Email sent to ${payload.to} successfully via Mailchimp.`)
    } catch (error) {
      console.error("Failed to send email with Mailchimp:", error)
      throw new Error("Mailchimp email delivery failed.")
    }
  }
}
