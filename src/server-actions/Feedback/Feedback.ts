"use server"

import {
  CreateFeedback,
  GetAllFeedback
} from "@/src/db/data-access/feedback/query"
import {
  notifyUserFeedbackSubmitted,
  notifyAdminNewFeedback
} from "@/src/services/notify/feedback/feedback"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"

export async function SubmitFeedbackAction(data: {
  name: string
  email: string
  subject: string
  description: string
  fileBase64?: string
  fileName?: string
  fileType?: string
}) {
  try {
    let fileUrl: string | null = null

    if (data.fileBase64 && data.fileName && data.fileType) {
      const fileBuffer = base64ToBuffer(data.fileBase64)
      const uploaded = await uploadFileAndSaveMetadata(
        fileBuffer,
        data.fileName,
        data.fileType,
        "feedback"
      )
      fileUrl = uploaded.fileUrl
    }

    // Create feedback record
    const feedback = await CreateFeedback({
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      file_url: fileUrl
    })

    const submittedAt = new Date().toLocaleString()

    // Send confirmation email to user via queue
    await notifyUserFeedbackSubmitted("feedback_submitted", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      submittedAt,
      fileUrl
    })

    // Send notification to all super admins via queue
    await notifyAdminNewFeedback("new_feedback_admin", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      description: data.description,
      submittedAt,
      feedbackId: feedback.id,
      fileUrl
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
