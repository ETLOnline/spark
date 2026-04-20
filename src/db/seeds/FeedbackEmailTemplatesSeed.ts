import { emailTemplatesTable } from "../schema"
import { db } from "../index"
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

export async function seedFeedbackEmailTemplates() {
  console.log("Seeding feedback email templates...")

  for (const template of feedbackTemplatesToSeed) {
    try {
      // Check if template already exists
      const existing = await db
        .select()
        .from(emailTemplatesTable)
        .where((table) => table.name === template.name)

      if (existing.length > 0) {
        // Update existing template
        await db
          .update(emailTemplatesTable)
          .set({
            subject: template.subject,
            body: template.body,
            updated_at: new Date().toISOString()
          })
          .where((table) => table.name === template.name)
        console.log(`Updated template: ${template.name}`)
      } else {
        // Insert new template
        await db.insert(emailTemplatesTable).values({
          unique_id: crypto.randomUUID(),
          name: template.name,
          subject: template.subject,
          body: template.body,
          isActive: true,
          created_at: new Date().toISOString()
        })
        console.log(`Created template: ${template.name}`)
      }
    } catch (error) {
      console.error(`Error seeding template ${template.name}:`, error)
    }
  }

  console.log("Feedback email templates seeded successfully!")
}

// Run if called directly
seedFeedbackEmailTemplates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
