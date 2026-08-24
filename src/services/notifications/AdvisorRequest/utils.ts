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
