import { emailTemplatesTable } from "../schema"
import { db } from "../index"
import { InferInsertModel, sql } from "drizzle-orm"
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
    name: NotificationEvent.COMMUNITY_REQUEST,
    subject: "Your Community Request Has Been Submitted",
    body: loadTemplate("submit_community_request.html")
  },
  {
    name: NotificationEvent.ADMIN_NEW_COMMUNITY_REQUEST,
    subject: "New Community Request Submitted",
    body: loadTemplate("admin-community-request-notification.html")
  },
  {
    name: NotificationEvent.COMMUNITY_REQUEST_ACCEPTED,
    subject: "Community Creation Request Approved",
    body: loadTemplate("community_creation_request_approved.html")
  },
  {
    name: NotificationEvent.COMMUNITY_REQUEST_REJECTED,
    subject: "Community Creation Request Declined",
    body: loadTemplate("community_creation_request_decline.html")
  }
]

export const EmailTemplatesForCommunityRequestSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("🌱 Seeding email templates...")

      await tx
        .insert(emailTemplatesTable)
        .values(templatesToSeed)
        .onConflictDoUpdate({
          target: emailTemplatesTable.name, // must be unique in schema
          set: {
            subject: templatesToSeed[0].subject,
            body: templatesToSeed[0].body
          }
        })

      console.log("✅ Email template seeding complete.")
    } catch (error) {
      console.error("❌ Error seeding email templates:", error)
      throw error // Let transaction auto-rollback
    }
  })
}
