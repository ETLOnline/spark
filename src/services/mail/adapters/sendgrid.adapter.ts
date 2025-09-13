import sgMail from "@sendgrid/mail"
import { MailAdapter, MailPayload } from "../types/interface"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export class SendGridAdapter implements MailAdapter {
  async sendMail(payload: MailPayload): Promise<void> {
    const msg: any = {
      to: payload.to,
      from: payload.from,
      subject: payload.subject,
      html: payload.body
    }

    try {
      const sendMail = await sgMail.send(msg)
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
