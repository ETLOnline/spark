import { getSiteLogoUrl } from "@/src/utils/clientHelper"
import { AddToQueue } from "../../queue/addToQueue"
import { GetAllSuperAdmins } from "@/src/db/data-access/feedback/query"

type ContactUsPayloadInput = {
  name: string
  email: string
  subject: string
  description: string
  submittedAt: string
}

function buildContactUsPayload(data: ContactUsPayloadInput) {
  const siteLogo = getSiteLogoUrl()
  const payload: any = {
    logoUrl: siteLogo,
    userName: data.name,
    userEmail: data.email,
    subject: data.subject,
    description: data.description,
    submittedAt: data.submittedAt,
    messageType: "Contact Us"
  }
  return payload
}

export const notifyUserContactUsSubmitted = async (
  event: string,
  userData: {
    name: string
    email: string
    subject: string
    description: string
    submittedAt: string
  }
) => {
  const payload = buildContactUsPayload(userData)
  await AddToQueue({
    sendingTo: [userData.email],
    event,
    payload,
    withData: true
  })
}

export const notifyAdminNewContactUs = async (
  event: string,
  contactData: {
    name: string
    email: string
    subject: string
    description: string
    submittedAt: string
  }
) => {
  const superAdmins = await GetAllSuperAdmins()
  if (superAdmins.length === 0) return
  const superAdminEmails = superAdmins.map((admin) => admin.email)
  const payload = buildContactUsPayload(contactData)
  await AddToQueue({
    sendingTo: superAdminEmails,
    event,
    payload,
    withData: true
  })
}
