"use server"

import {
  CreateFeedback,
  GetAllFeedback,
  GetAllSuperAdmins
} from "@/src/db/data-access/feedback/query"
import { getEmailTemplateByName } from "@/src/db/data-access/emails/query"
import { MailService } from "@/src/services/mail/sendMail"
import Handlebars from "handlebars"

const mailer = new MailService()

export async function SubmitFeedbackAction(data: {
  name: string
  email: string
  subject: string
  description: string
  file_url?: string
}) {
  try {
    // Create feedback record
    const feedback = await CreateFeedback({
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      file_url: data.file_url || null
    })

    // Send confirmation email to user
    const userTemplate = await getEmailTemplateByName("feedback_submitted")
    if (userTemplate) {
      const compiled = Handlebars.compile(userTemplate.body)
      const renderedBody = compiled({
        userName: data.name,
        userEmail: data.email,
        subject: data.subject,
        description: data.description,
        submittedAt: new Date().toLocaleString()
      })

      const compiledSubject = Handlebars.compile(userTemplate.subject)
      const renderedSubject = compiledSubject({
        userName: data.name
      })

      await mailer.sendEmail({
        to: data.email,
        from: process.env.EMAIL_FROM_ADDRESS!,
        subject: renderedSubject,
        body: renderedBody
      })
    }

    // Send notification to all super admins
    const superAdmins = await GetAllSuperAdmins()
    if (superAdmins.length > 0) {
      const adminTemplate = await getEmailTemplateByName("new_feedback_admin")
      if (adminTemplate) {
        const compiled = Handlebars.compile(adminTemplate.body)
        const renderedBody = compiled({
          userName: data.name,
          userEmail: data.email,
          subject: data.subject,
          description: data.description,
          fileUrl: data.file_url || "No file attached",
          submittedAt: new Date().toLocaleString(),
          feedbackId: feedback.id
        })

        const compiledSubject = Handlebars.compile(adminTemplate.subject)
        const renderedSubject = compiledSubject({
          subject: data.subject
        })

        await Promise.all(
          superAdmins.map((admin) =>
            mailer.sendEmail({
              to: admin.email,
              from: process.env.EMAIL_FROM_ADDRESS!,
              subject: renderedSubject,
              body: renderedBody
            })
          )
        )
      }
    }

    return { success: true, feedback }
  } catch (error: any) {
    console.error("Error submitting feedback:", error)
    throw new Error(error.message || "Failed to submit feedback")
  }
}

export async function GetAllFeedbackAction() {
  try {
    const feedback = await GetAllFeedback()
    return { success: true, feedback }
  } catch (error: any) {
    console.error("Error fetching feedback:", error)
    throw new Error(error.message || "Failed to fetch feedback")
  }
}
