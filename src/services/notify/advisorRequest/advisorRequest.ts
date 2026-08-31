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

export async function createAdvisorRequestResponseEmailNotification(
  request: AdvisorRequestEmailContext,
  status: "accepted" | "rejected",
  advisorName?: string
) {
  const studentRes = await FindUserByUniqueIdAction(request.requested_by)
  if (!studentRes.data?.email) return

  const accepted = status === "accepted"
  const ctaLink = createAbsoluteUrl(
    `${getSpaceBasePath(request.channel_slug, request.space_slug)}?page-type=fyp`
  )

  const payload = {
    logoUrl: getSiteLogoUrl(),
    studentName:
      `${studentRes.data.first_name ?? ""} ${studentRes.data.last_name ?? ""}`.trim(),
    advisorName: accepted ? advisorName : undefined,
    fypTitle: request.fyp_title,
    ctaLink,
    statusLabel: accepted ? "Accepted" : "Update",
    headerBgColor: accepted ? "#51ecdc" : "#f1f5f9",
    actionVerb: accepted ? "been accepted" : "not been accepted by any advisor",
    ctaText: accepted ? "View Request" : "Resubmit Request",
    footerText: accepted
      ? "Log in to see your advisor's details."
      : "You can update your details and resubmit anytime."
  }

  await AddToQueue({
    sendingTo: [studentRes.data.email],
    event: accepted
      ? NotificationEvent.ADVISOR_REQUEST_ACCEPTED
      : NotificationEvent.ADVISOR_REQUEST_REJECTED,
    payload,
    withData: true
  })
}
