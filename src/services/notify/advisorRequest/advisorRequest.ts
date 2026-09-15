import { AddToQueue } from "../../queue/addToQueue"
import { NotificationEvent } from "../types/events"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import { getSpaceBasePath } from "@/src/utils/helpers"

interface AdvisorRequestEmailContext {
  requested_by: string
  fyp_title: string
  space_slug: string
  channel_slug?: string | null
}

// Each status has its own dedicated template file with the copy baked
// directly into the HTML (see public/email-templates/advisor_request_*.html)
// — the message never actually varies at runtime, so there's no reason to
// thread it through shared variables. Only "accepted" needs a variable for
// the advisor's name, since that's genuinely different every time; the
// other statuses never show one at all.
const EVENT_BY_STATUS = {
  accepted: NotificationEvent.ADVISOR_REQUEST_ACCEPTED,
  rejected: NotificationEvent.ADVISOR_REQUEST_REJECTED,
  expired: NotificationEvent.ADVISOR_REQUEST_EXPIRED,
  declined: NotificationEvent.ADVISOR_REQUEST_ADVISOR_DECLINED
} as const

export async function createAdvisorRequestResponseEmailNotification(
  request: AdvisorRequestEmailContext,
  status: "accepted" | "rejected" | "expired" | "declined",
  advisorName?: string
) {
  const studentRes = await FindUserByUniqueIdAction(request.requested_by)
  if (!studentRes.data?.email) return

  const ctaLink = createAbsoluteUrl(
    `${getSpaceBasePath(request.channel_slug, request.space_slug)}?page-type=fyp`
  )

  const payload = {
    logoUrl: getSiteLogoUrl(),
    studentName:
      `${studentRes.data.first_name ?? ""} ${studentRes.data.last_name ?? ""}`.trim(),
    fypTitle: request.fyp_title,
    ctaLink,
    ...(status === "accepted" ? { advisorName } : {})
  }

  await AddToQueue({
    sendingTo: [studentRes.data.email],
    event: EVENT_BY_STATUS[status],
    payload,
    withData: true
  })
}
