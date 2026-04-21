import { getSiteLogoUrl } from "@/src/utils/clientHelper"
import { AddToQueue } from "../../queue/addToQueue"
import { GetAllSuperAdmins } from "@/src/db/data-access/feedback/query"

type FeedbackPayloadInput = {
  name: string
  email: string
  subject: string
  description: string
  submittedAt: string
  feedbackId?: number
}

function buildFeedbackPayload(data: FeedbackPayloadInput) {
  const siteLogo = getSiteLogoUrl()
  const payload: any = {
    logoUrl: siteLogo,
    userName: data.name,
    userEmail: data.email,
    subject: data.subject,
    description: data.description,
    submittedAt: data.submittedAt
  }
  if (data.feedbackId !== undefined) payload.feedbackId = data.feedbackId
  return payload
}

export const notifyUserFeedbackSubmitted = async (
  event: string,
  userData: {
    name: string
    email: string
    subject: string
    description: string
    submittedAt: string
  }
) => {
  const payload = buildFeedbackPayload(userData)
  await AddToQueue({
    sendingTo: [userData.email],
    event,
    payload,
    withData: true
  })
}

export const notifyAdminNewFeedback = async (
  event: string,
  feedbackData: {
    name: string
    email: string
    subject: string
    description: string
    submittedAt: string
    feedbackId: number
  }
) => {
  const superAdmins = await GetAllSuperAdmins()
  if (superAdmins.length === 0) return

  const superAdminEmails = superAdmins.map((admin) => admin.email)
  const payload = buildFeedbackPayload(feedbackData)
  await AddToQueue({
    sendingTo: superAdminEmails,
    event,
    payload,
    withData: true
  })
}
