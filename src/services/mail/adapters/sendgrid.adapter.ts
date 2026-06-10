import sgMail from "@sendgrid/mail"
import { MailAdapter, MailPayload } from "../types/interface"

let apiKeyInitialized = false

const initApiKey = () => {
  if (apiKeyInitialized) return

  const apiKey = process.env.SENDGRID_API_KEY

  if (!apiKey || !apiKey.startsWith("SG.")) {
    throw new Error(
      "SendGrid is not configured: SENDGRID_API_KEY is missing or invalid (must start with 'SG.')."
    )
  }

  sgMail.setApiKey(apiKey)
  apiKeyInitialized = true
}

export class SendGridAdapter implements MailAdapter {
  async sendMail(payload: MailPayload): Promise<void> {
    initApiKey()

    const msg: any = {
      to: payload.to,
      from: payload.from,
      subject: payload.subject,
      html: payload.body
    }

    try {
      await sgMail.send(msg)
      console.log(`Email sent to ${payload.to} successfully via SendGrid.`)
    } catch (error: any) {
      console.error("Failed to send email with SendGrid:", error)
      if (error.response) {
        console.error(error.response.body)
      }
      throw new Error("SendGrid email delivery failed.")
    }
  }
}
