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
    name: NotificationEvent.CONTACT_US_SUBMITTED,
    subject: "We Received Your Message - {{userName}}",
    body: loadTemplate("contact_us_submitted.html")
  },
  {
    name: NotificationEvent.NEW_CONTACT_US_ADMIN,
    subject: "New Contact Us Message: {{subject}}",
    body: loadTemplate("new_contact_us_admin.html")
  }
]

export const ContactUsEmailTemplatesSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("🌱 Seeding contact us email templates...")

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

      console.log("✅ Contact us email template seeding complete.")
    } catch (error) {
      console.error("❌ Error seeding contact us email templates:", error)
      throw error // Let transaction auto-rollback
    }
  })
}
