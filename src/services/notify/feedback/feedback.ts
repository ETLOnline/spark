import { getSiteLogoUrl } from "@/src/utils/clientHelper"
import { AddToQueue } from "../../queue/addToQueue"
import { GetAllSuperAdmins } from "@/src/db/data-access/feedback/query"

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
  const siteLogo = getSiteLogoUrl()
  const payload = {
    logoUrl: siteLogo,
    userName: userData.name,
    userEmail: userData.email,
    subject: userData.subject,
    description: userData.description,
    submittedAt: userData.submittedAt
  }

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

  const siteLogo = getSiteLogoUrl()
  const payload = {
    logoUrl: siteLogo,
    userName: feedbackData.name,
    userEmail: feedbackData.email,
    subject: feedbackData.subject,
    description: feedbackData.description,
    submittedAt: feedbackData.submittedAt,
    feedbackId: feedbackData.feedbackId
  }

  await AddToQueue({
    sendingTo: superAdminEmails,
    event,
    payload,
    withData: true
  })
}
