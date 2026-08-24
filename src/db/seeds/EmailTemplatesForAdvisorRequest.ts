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
    name: NotificationEvent.NEW_ADVISOR_REQUEST,
    subject: "New Advisor Request in {{domainName}}",
    body: loadTemplate("new_advisor_request.html")
  }
]

export const EmailTemplatesForAdvisorRequestSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("🌱 Seeding advisor request email templates...")

      await tx
        .insert(emailTemplatesTable)
        .values(templatesToSeed)
        .onConflictDoUpdate({
          target: emailTemplatesTable.name,
          set: {
            subject: templatesToSeed[0].subject,
            body: templatesToSeed[0].body
          }
        })

      console.log("✅ Advisor request email template seeding complete.")
    } catch (error) {
      console.error("❌ Error seeding advisor request email templates:", error)
      throw error
    }
  })
}
