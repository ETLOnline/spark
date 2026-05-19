import { SendGridAdapter } from "../adapters/sendgrid.adapter"
import { MailchimpAdapter } from "../adapters/mailchimp.adapter"
import { MailAdapter, MailPayload } from "../types/interface"
import { DEFAULT_MAIL_PROVIDER, MailProvider } from "../constants"

class NoopMailAdapter implements MailAdapter {
  async sendMail(payload: MailPayload): Promise<void> {
    console.warn(
      `[mail] No email provider configured — skipping send to ${payload.to} ("${payload.subject}").`
    )
  }
}

const isSendGridConfigured = (): boolean => {
  const key = process.env.SENDGRID_API_KEY
  return !!key && key.startsWith("SG.")
}

const isMailchimpConfigured = (): boolean => !!process.env.MAILCHIMP_API_KEY

export const getMailClient = (): MailAdapter => {
  const provider = (
    process.env.EMAIL_PROVIDER || DEFAULT_MAIL_PROVIDER
  ).toLowerCase() as MailProvider

  switch (provider) {
    case MailProvider.Mailchimp:
      if (!isMailchimpConfigured()) {
        console.warn(
          "[mail] MAILCHIMP_API_KEY missing — falling back to no-op mail adapter."
        )
        return new NoopMailAdapter()
      }
      console.log("Using Mailchimp Adapter")
      return new MailchimpAdapter()
    case MailProvider.SendGrid:
    default:
      if (!isSendGridConfigured()) {
        console.warn(
          "[mail] SENDGRID_API_KEY missing or invalid (must start with 'SG.') — falling back to no-op mail adapter."
        )
        return new NoopMailAdapter()
      }
      console.log("Using SendGrid Adapter (default)")
      return new SendGridAdapter()
  }
}
