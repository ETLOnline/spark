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
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`)
    }
  }
}
