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
