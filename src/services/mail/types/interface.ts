export interface MailPayload {
  to: string
  from: string
  subject: string
  body?: string
  templateId?: string
  templateData?: any
}

export interface MailAdapter {
  sendMail(payload: MailPayload): Promise<void>
}
