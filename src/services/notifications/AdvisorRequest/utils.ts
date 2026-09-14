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
  actor: { unique_id: string; profile_url?: string | null },
  advisorName?: string
) {
  const deepLink = `${getSpaceBasePath(request.channel_slug, request.space_slug)}?page-type=fyp`
  const accepted = status === "accepted"

  const template = {
    title: accepted ? "Advisor request accepted" : "Advisor request update",
    body: accepted
      ? `${advisorName ?? "An advisor"} accepted your advisor request for "${request.fyp_title}".`
      : `Your advisor request for "${request.fyp_title}" was not accepted by any advisor. You can resubmit anytime.`,
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
    title: "Advisor request update",
    body: `One of the advisors reviewing your request for "${request.fyp_title}" has declined it. Other advisors are still reviewing your request.`,
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
    title: "Advisor request expired",
    body: `Your advisor request for "${request.fyp_title}" has expired — no advisor accepted it within the 14-day window. You can resubmit anytime.`,
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
