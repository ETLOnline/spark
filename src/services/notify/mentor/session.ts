"use server"

import { AddToQueue } from "../../queue/addToQueue"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { SelectSessionRequest } from "@/src/db/schema"

export async function notifySessionSlotSuggested(
  event: string,
  request: SelectSessionRequest
) {
  if (!request.mentee) return

  const siteLogo = getSiteLogoUrl()
  const sessionLink = createAbsoluteUrl(`/mentors`)
  const mentorName = request.mentor
    ? `${request.mentor.first_name} ${request.mentor.last_name}`
    : "Your mentor"

  const payload = {
    logoUrl: siteLogo,
    menteeName: `${request.mentee.first_name} ${request.mentee.last_name}`,
    mentorName,
    topic: request.topic,
    suggestionMessage: request.suggestion_message ?? "",
    slotCount: (request.suggested_slot_ids ?? []).length,
    sessionLink,
    expiresAt: request.suggestion_expires_at ?? ""
  }

  await AddToQueue({
    sendingTo: [request.mentee.email],
    event,
    payload,
    withData: true
  })
}
