import { SelectAdvisorRequest, SelectUser } from "@/src/db/schema"
import { AddToQueue } from "../../queue/addToQueue"
import { SendSystemNotification } from "../../system-notification/SystemNotification.utils"
import { NotificationEvent } from "../types/events"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"

/** Notifies advisors (in-app + email) that a new advisor request landed in their domain. */
export async function notifyAdvisorsOfNewAdvisorRequest(
  advisors: SelectUser[],
  request: SelectAdvisorRequest
) {
  if (!advisors.length) return

  const requesterId = request.requested_by
  const requesterName =
    `${request.requester?.first_name} ${request.requester?.last_name}`.trim()
  const fypTitle = request.fyp_title
  const domainName = request.domain?.name ?? ""
  const spaceName = request.space?.space_name
  const channelSlug = request.space?.channel?.channel_slug
  const spaceSlug = request.space?.space_slug

  const deepLink = `/channels/${channelSlug}/spaces/${spaceSlug}`

  await SendSystemNotification({
    user_id: requesterId,
    receivers: advisors.map((advisor) => advisor.unique_id),
    template: {
      title: `New advisor request in ${domainName}`,
      body: `${requesterName} from ${spaceName} requested an advisor for "${fypTitle}" in ${domainName}.`,
      deep_link: deepLink
    }
  })

  const advisorEmails = advisors.map((advisor) => advisor.email)

  if (!advisorEmails.length) return

  await AddToQueue({
    sendingTo: advisorEmails,
    event: NotificationEvent.NEW_ADVISOR_REQUEST,
    payload: {
      logoUrl: getSiteLogoUrl(),
      requesterName,
      fypTitle,
      domainName,
      spaceName,
      ctaLink: createAbsoluteUrl(deepLink)
    },
    withData: true
  })
}
