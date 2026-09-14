import { SendSystemNotification } from "../../system-notification/SystemNotification.utils"
import { sendPushNotification } from "../PushNotification.utils"
import { getSpaceBasePath } from "@/src/utils/helpers"

interface AdvisorRequestNotificationContext {
  requested_by: string
  fyp_title: string
  space_slug: string
  channel_slug?: string | null
}

export async function sendAdvisorRequestResponseNotification(
  request: AdvisorRequestNotificationContext,
  status: "accepted" | "rejected",
  actor: { unique_id: string; profile_url?: string | null }
) {
  const deepLink = `${getSpaceBasePath(request.channel_slug, request.space_slug)}?page-type=fyp`
  const accepted = status === "accepted"

  const template = {
    title: accepted ? "FYP Request Accepted" : "FYP Request Rejected",
    body: accepted
      ? "Your FYP request has been accepted. Visit your Space to get started."
      : "Your FYP request was not accepted by any advisor. You may submit a new request.",
    deep_link: deepLink,
    icon: accepted ? actor.profile_url || "" : ""
  }

  await SendSystemNotification({
    user_id: actor.unique_id,
    receivers: [request.requested_by],
    template
  })

  await sendPushNotification({
    receivers: [request.requested_by],
    template
  })
}

/** Sent every time a single advisor declines, while the request is still
 * alive (other advisors haven't all responded yet). Deliberately generic —
 * never names or otherwise identifies which advisor rejected it, unlike
 * sendAdvisorRequestResponseNotification's final "rejected" message, which
 * fires separately once every advisor has responded or the request expires. */
export async function sendAdvisorRequestSingleDeclineNotification(
  request: AdvisorRequestNotificationContext
) {
  const deepLink = `${getSpaceBasePath(request.channel_slug, request.space_slug)}?page-type=fyp`

  const template = {
    title: "FYP Request Declined",
    body: "An advisor has declined your FYP request. View your dashboard for details.",
    deep_link: deepLink,
    icon: ""
  }

  await SendSystemNotification({
    user_id: request.requested_by,
    receivers: [request.requested_by],
    template
  })

  await sendPushNotification({
    receivers: [request.requested_by],
    template
  })
}

/** System-triggered (no acting advisor) — sent by the expiry cron when the
 * 14-day window passes with no advisor accepting the request. */
export async function sendAdvisorRequestExpiredNotification(
  request: AdvisorRequestNotificationContext
) {
  const deepLink = `${getSpaceBasePath(request.channel_slug, request.space_slug)}?page-type=fyp`

  const template = {
    title: "FYP Request Expired",
    body: "Your FYP request has expired with no response. You may submit a new request.",
    deep_link: deepLink,
    icon: ""
  }

  await SendSystemNotification({
    user_id: request.requested_by,
    receivers: [request.requested_by],
    template
  })

  await sendPushNotification({
    receivers: [request.requested_by],
    template
  })
}
