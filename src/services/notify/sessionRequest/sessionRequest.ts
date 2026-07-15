import moment from "moment-timezone"
import { AddToQueue } from "../../queue/addToQueue"
import { NotificationEvent } from "../types/events"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import { SelectSessionRequest } from "@/src/db/schema"

function formatSlotText(request: SelectSessionRequest) {
  const date = moment(request.session_date, "YYYY-MM-DD").format(
    "dddd, MMM D, YYYY"
  )
  const start = moment(request.start_time, "HH:mm").format("h:mm A")
  const end = moment(request.end_time, "HH:mm").format("h:mm A")
  return `${date} · ${start} – ${end}`
}

export async function createSessionRequestEmailNotification(
  mentorId: string,
  request: SelectSessionRequest,
  menteeName: string
) {
  const mentorRes = await FindUserByUniqueIdAction(mentorId)
  if (!mentorRes.data?.email) return

  const payload = {
    logoUrl: getSiteLogoUrl(),
    mentorName:
      `${mentorRes.data.first_name ?? ""} ${mentorRes.data.last_name ?? ""}`.trim(),
    menteeName,
    topic: request.topic,
    description: request.description ?? undefined,
    slotText: formatSlotText(request),
    ctaLink: createAbsoluteUrl("/profile/session-requests")
  }

  await AddToQueue({
    sendingTo: [mentorRes.data.email],
    event: NotificationEvent.NEW_SESSION_REQUEST,
    payload,
    withData: true
  })
}
