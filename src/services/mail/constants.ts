export enum MailProvider {
  SendGrid = "sendgrid",
  Mailchimp = "mailchimp"
}

export const DEFAULT_MAIL_PROVIDER: MailProvider = MailProvider.SendGrid
