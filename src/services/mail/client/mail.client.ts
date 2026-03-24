import { SendGridAdapter } from "../adapters/sendgrid.adapter"
import { MailchimpAdapter } from "../adapters/mailchimp.adapter"
import { MailAdapter } from "../types/interface"

const EMAIL_PROVIDER: string = process.env.EMAIL_PROVIDER || "sendgrid"

export const getMailClient = (): MailAdapter => {
  switch (EMAIL_PROVIDER.toLowerCase()) {
    case "mailchimp":
      console.log("Using Mailchimp Adapter")
      return new MailchimpAdapter()
    case "sendgrid":
    default:
      console.log("Using SendGrid Adapter (default)")
      return new SendGridAdapter()
  }
}
