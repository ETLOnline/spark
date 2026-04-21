import { sendEmailFromTemplate } from "@/src/utils/serverHelpers"

export async function processFeedbackSubmittedNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  await sendEmailFromTemplate({
    templateName: "feedback_submitted",
    payload: job.payload,
    sendingTo: job.sendingTo
  })
}

export async function processNewFeedbackAdminNotification(job: {
  sendingTo: string[]
  event: string
  payload: any
}) {
  await sendEmailFromTemplate({
    templateName: "new_feedback_admin",
    payload: job.payload,
    sendingTo: job.sendingTo
  })
}
