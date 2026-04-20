import { emailTemplatesTable } from "../schema"
import { db } from "../index"
import { sql } from "drizzle-orm"
import fs from "fs"
import path from "path"

const loadTemplate = (filename: string) => {
  return fs.readFileSync(
    path.join(process.cwd(), "public/email-templates", filename),
    "utf-8"
  )
}

const feedbackTemplatesToSeed = [
  {
    name: "feedback_submitted",
    subject: "We Received Your Feedback - {{userName}}",
    body: loadTemplate("feedback_submitted.html")
  },
  {
    name: "new_feedback_admin",
    subject: "New Feedback Received: {{subject}}",
    body: loadTemplate("new_feedback_admin.html")
  }
]

export const seedFeedbackEmailTemplates = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("🌱 Seeding feedback email templates...")

      // Delete existing feedback templates
      await tx.execute(
        sql`DELETE FROM email_templates WHERE name IN ('feedback_submitted', 'new_feedback_admin')`
      )

      // Insert new templates
      await tx.insert(emailTemplatesTable).values(feedbackTemplatesToSeed)

      console.log("✅ Feedback email templates seeded successfully!")
    } catch (error) {
      console.error("Error seeding feedback email templates:", error)
      throw error
    }
  })
}
