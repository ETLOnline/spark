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
    name: "update_task",
    subject: "Task has been updated",
    body: loadTemplate("update_task.html")
  },
  {
    name: NotificationEvent.NEW_CONNECTION,
    subject: "New Connection",
    body: loadTemplate("new_connection.html")
  },
  {
    name: NotificationEvent.CONNECTION_ACCEPTED,
    subject: "New Connection",
    body: loadTemplate("accept_connection.html")
  },
  {
    name: "project_invite",
    subject: `You've Been Added to a Project - {{projectName}}`,
    body: loadTemplate("project_invite.html")
  },
  {
    name: NotificationEvent.CHAT_INVITE,
    subject: "You've got a new chat",
    body: loadTemplate("chat_invite.html")
  },
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
  },
  {
    name: NotificationEvent.JOIN_INVITE_EMAIL,
    subject: `You've Been Invited to join spark {{entityType}}!`,
    body: loadTemplate("join_invite_email.html")
  },
  {
    name: NotificationEvent.FEEDBACK_SUBMITTED,
    subject: "We Received Your Feedback - {{userName}}",
    body: loadTemplate("feedback_submitted.html")
  },
  {
    name: NotificationEvent.NEW_FEEDBACK_ADMIN,
    subject: "New Feedback Received: {{subject}}",
    body: loadTemplate("new_feedback_admin.html")
  }
]

export const EmailTemplatesSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("🌱 Seeding email templates...")
      await tx.execute(sql`Truncate email_templates CASCADE ;`)
      // Use the transaction's `insert` method
      await tx.insert(emailTemplatesTable).values(templatesToSeed)

      console.log("✅ Email template seeding complete.")
    } catch (error) {
      console.error("❌ Error seeding email templates:", error)
      tx.rollback() // Roll back the transaction on failure
      process.exit(1)
    }
  })
}
