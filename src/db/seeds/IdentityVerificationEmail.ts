import { emailTemplatesTable } from "../schema"
import { db } from "../index"
import { InferInsertModel } from "drizzle-orm"
import fs from "fs"
import path from "path"
import { NotificationEvent } from "@/src/services/notify/types/events"

type NewEmailTemplate = InferInsertModel<typeof emailTemplatesTable>

const loadTemplate = (filename: string) => {
  return fs.readFileSync(
    path.join(process.cwd(), "public/email-templates", filename),
    "utf-8"
  )
}

const templatesToSeed: NewEmailTemplate[] = [
  {
    name: NotificationEvent.IDENTITY_VERIFICATION_OTP,
    subject: "Your Spark verification code",
    body: loadTemplate("identity_verification_otp.html")
  },
  {
    name: NotificationEvent.IDENTITY_VERIFIED,
    subject: "Your identity has been verified",
    body: loadTemplate("identity_verified_success.html")
  }
]

export const IdentityVerificationEmailSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("🌱 Seeding identity verification email templates...")

      for (const template of templatesToSeed) {
        await tx
          .insert(emailTemplatesTable)
          .values(template)
          .onConflictDoUpdate({
            target: emailTemplatesTable.name,
            set: {
              subject: template.subject,
              body: template.body
            }
          })
      }

      console.log("✅ Identity verification email template seeding complete.")
    } catch (error) {
      console.error(
        "❌ Error seeding identity verification email templates:",
        error
      )
      throw error
    }
  })
}
