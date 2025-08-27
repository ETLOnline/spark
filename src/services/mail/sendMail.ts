import { MailAdapter, MailPayload } from "./types/interface"
import { getMailClient } from "./client/mail.client"

export class MailService {
  private adapter: MailAdapter

  constructor() {
    this.adapter = getMailClient()
  }

  async sendEmail(payload: MailPayload): Promise<void> {
    await this.adapter.sendMail(payload)
  }
}
