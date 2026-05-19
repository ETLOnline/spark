import { MailAdapter, MailPayload } from "./types/interface"
import { getMailClient } from "./client/mail.client"

let adapter: MailAdapter | null = null

const getAdapter = (): MailAdapter => {
  if (!adapter) {
    adapter = getMailClient()
  }
  return adapter
}

export const mailer = {
  sendEmail: async (payload: MailPayload): Promise<void> => {
    try {
      await getAdapter().sendMail(payload)
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`)
    }
  }
}
