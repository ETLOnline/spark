import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { AddToQueue } from "../../queue/addToQueue"
import {
  GetFeaturedUsersAction,
  GetSuperAdminsAction
} from "@/src/server-actions/User/User"
import { SelectCommunityRequest } from "@/src/db/schema"

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
  if (!authUser) throw new Error("Unauthorized")

  const SuperAmins = await GetSuperAdminsAction()

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

export const notifyUserCommunityRequestAccepted = async (
  event: string,
  communityRequest: SelectCommunityRequest
) => {
  const user = await GetFeaturedUsersAction({
    userId: communityRequest.contact_person_id
  })

  const requester = user.data?.[0]

  const siteLogo = getSiteLogoUrl()
  const payload = {
    logoUrl: siteLogo,
    subject: "🎉 Community Request Approved",
    userName: `${requester?.first_name} ${requester?.last_name}`,
    universityName: communityRequest.university_name,
    communityLink: communityRequest.invite_link
  }

  await AddToQueue({
    sendingTo: [requester?.email || ""],
    event,
    payload,
    withData: true
  })
}

export const notifyUserCommunityRequestDeclined = async (
  event: string,
  communityRequest: SelectCommunityRequest
) => {
  const user = await GetFeaturedUsersAction({
    userId: communityRequest.contact_person_id
  })

  const requester = user.data?.[0]

  const siteLogo = getSiteLogoUrl()
  const payload = {
    logoUrl: siteLogo,
    subject: "Community Request Declined",
    userName: `${requester?.first_name} ${requester?.last_name}`,
    universityName: communityRequest.university_name,
    declineReason: communityRequest.reason
  }

  await AddToQueue({
    sendingTo: [requester?.email || ""],
    event,
    payload,
    withData: true
  })
}
