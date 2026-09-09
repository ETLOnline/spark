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

const RESPONSE_COPY = {
  accepted: {
    event: NotificationEvent.ADVISOR_REQUEST_ACCEPTED,
    statusLabel: "Accepted",
    headerBgColor: "#51ecdc",
    actionVerb: "been accepted",
    ctaText: "View Request",
    footerText: "Log in to see your advisor's details."
  },
  rejected: {
    event: NotificationEvent.ADVISOR_REQUEST_REJECTED,
    statusLabel: "Update",
    headerBgColor: "#f1f5f9",
    actionVerb: "not been accepted by any advisor",
    ctaText: "Resubmit Request",
    footerText: "You can update your details and resubmit anytime."
  },
  expired: {
    event: NotificationEvent.ADVISOR_REQUEST_EXPIRED,
    statusLabel: "Expired",
    headerBgColor: "#f1f5f9",
    actionVerb: "expired — the 14-day window to find an advisor has passed",
    ctaText: "Resubmit Request",
    footerText: "You can update your details and resubmit anytime."
  }
} as const

export async function createAdvisorRequestResponseEmailNotification(
  request: AdvisorRequestEmailContext,
  status: "accepted" | "rejected" | "expired",
  advisorName?: string
) {
  const studentRes = await FindUserByUniqueIdAction(request.requested_by)
  if (!studentRes.data?.email) return

  const copy = RESPONSE_COPY[status]
  const ctaLink = createAbsoluteUrl(
    `${getSpaceBasePath(request.channel_slug, request.space_slug)}?page-type=fyp`
  )

  const payload = {
    logoUrl: getSiteLogoUrl(),
    studentName:
      `${studentRes.data.first_name ?? ""} ${studentRes.data.last_name ?? ""}`.trim(),
    advisorName: status === "accepted" ? advisorName : undefined,
    fypTitle: request.fyp_title,
    ctaLink,
    statusLabel: copy.statusLabel,
    headerBgColor: copy.headerBgColor,
    actionVerb: copy.actionVerb,
    ctaText: copy.ctaText,
    footerText: copy.footerText
  }

  await AddToQueue({
    sendingTo: [studentRes.data.email],
    event: copy.event,
    payload,
    withData: true
  })
}
