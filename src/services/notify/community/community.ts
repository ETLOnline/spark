import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { AddToQueue } from "../../queue/addToQueue"

export const createCommunityRequestNotification = async (event: string) => {
  const authUser = await AuthUserAction()
  if (!authUser) throw new Error("Unauthorized")

  const siteLogo = getSiteLogoUrl()
  const linkUrl = createAbsoluteUrl(`/communities`)
  const payload = {
    logoUrl: siteLogo,
    subject: "New Community Request Submitted",
    UserName: `${authUser.first_name} ${authUser.last_name}`,
    dashboardLink: linkUrl
  }

  await AddToQueue({
    sendingTo: [authUser.email],
    event,
    payload,
    withData: true
  })
}
