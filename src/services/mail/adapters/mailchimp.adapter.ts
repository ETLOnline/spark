import mailchimp from "@mailchimp/mailchimp_transactional"
import { MailAdapter, MailPayload } from "../types/interface"

type MailchimpClient = ReturnType<typeof mailchimp>

let client: MailchimpClient | null = null

const getClient = (): MailchimpClient => {
  if (client) return client

  const apiKey = process.env.MAILCHIMP_API_KEY

  if (!apiKey) {
    throw new Error(
      "Mailchimp is not configured: MAILCHIMP_API_KEY is missing."
    )
  }

  client = mailchimp(apiKey)
  return client
}

export class MailchimpAdapter implements MailAdapter {
  async sendMail(payload: MailPayload): Promise<void> {
    const mailchimpClient = getClient()

    const message = {
      from_email: payload.from,
      from_name: "Spark",
      subject: payload.subject,
      html: payload.body,
      to: [{ email: payload.to, type: "to" }]
    }
    try {
      await mailchimpClient.messages.send({ message })
      console.log(`Email sent to ${payload.to} successfully via Mailchimp.`)
    } catch (error) {
      console.error("Failed to send email with Mailchimp:", error)
      throw new Error("Mailchimp email delivery failed.")
    }
  }
}
