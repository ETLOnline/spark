"use server"

import {
  CreateFeedback,
  GetAllFeedback
} from "@/src/db/data-access/feedback/query"
import {
  notifyUserFeedbackSubmitted,
  notifyAdminNewFeedback
} from "@/src/services/notify/feedback/feedback"

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

    const submittedAt = new Date().toLocaleString()

    // Send confirmation email to user via queue
    await notifyUserFeedbackSubmitted("feedback_submitted", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      submittedAt
    })

    // Send notification to all super admins via queue
    await notifyAdminNewFeedback("new_feedback_admin", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      submittedAt,
      feedbackId: feedback.id
    })

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
