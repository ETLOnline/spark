import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { AddToQueue } from "../../queue/addToQueue"
import { GetSuperAdminsAction } from "@/src/server-actions/User/User"

export const createCommunityRequestNotification = async (event: string) => {
  const authUser = await AuthUserAction()
  if (!authUser) throw new Error("Unauthorized")

  const siteLogo = getSiteLogoUrl()
  const linkUrl = createAbsoluteUrl(`/communities`)
  const payload = {
    logoUrl: siteLogo,
    subject: "New Community Request Submitted",
    userName: `${authUser.first_name} ${authUser.last_name}`,
    dashboardLink: linkUrl
  }

  await AddToQueue({
    sendingTo: [authUser.email],
    event,
    payload,
    withData: true
  })
}

export const notifyAdminNewCommunityRequest = async (event: string) => {
  const authUser = await AuthUserAction()

  const SuperAmins = await GetSuperAdminsAction()

  if (!authUser) throw new Error("Unauthorized")

  if (SuperAmins.data?.length === 0) return

  const SuperAdminsEmails = SuperAmins.data?.map((admin) => admin.email)

  const siteLogo = getSiteLogoUrl()
  const linkUrl = createAbsoluteUrl(`/admin`)
  const payload = {
    logoUrl: siteLogo,
    subject: "New Community Creation Request Submitted",
    userName: `${authUser.first_name} ${authUser.last_name}`,
    dashboardLink: linkUrl
  }

  await AddToQueue({
    sendingTo: SuperAdminsEmails || [],
    event,
    payload,
    withData: true
  })
}
