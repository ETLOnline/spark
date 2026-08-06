"use server"

import moment from "moment-timezone"
import { AddToQueue } from "../../queue/addToQueue"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"
import { SelectSessionRequest } from "@/src/db/schema"
import { GetMentorAvailability } from "@/src/db/data-access/mentor/query"

async function buildSuggestedSlotsHtml(request: SelectSessionRequest) {
  const keys = Array.from(
    new Set((request.suggested_slot_ids ?? []) as unknown as string[])
  )
  if (keys.length === 0) {
    return `<tr><td style="padding: 16px 20px; font-size: 14px; color: #64748b">Log in to view the proposed dates and times and choose the one that works for you.</td></tr>`
  }

  const slots = await GetMentorAvailability(request.mentor_id)
  const slotsById = new Map(slots.map((s) => [s.id, s]))

  const labels = keys
    .map((key) => ({
      date: key.slice(-10),
      slot: slotsById.get(Number(key.slice(0, key.length - 11)))
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ date, slot }) => {
      const dateLabel = moment(date, "YYYY-MM-DD").format("ddd, MMM D, YYYY")
      if (!slot) return dateLabel
      const start = moment(slot.start_time, "HH:mm").format("h:mm A")
      const end = moment(slot.end_time, "HH:mm").format("h:mm A")
      return `${dateLabel} · ${start} – ${end}`
    })

  return labels
    .map((label, i) => {
      const border = i > 0 ? " border-top: 1px solid #e2e8f0;" : ""
      return `<tr><td style="padding: 14px 20px; font-size: 14px; font-weight: 600; color: #1e293b;${border}">${label}</td></tr>`
    })
    .join("")
}

export async function notifySessionSlotSuggested(
  event: string,
  request: SelectSessionRequest
) {
  if (!request.mentee) return

  const siteLogo = getSiteLogoUrl()
  const sessionLink = createAbsoluteUrl(
    `/profile/${request.mentor_id}/availability`
  )
  const mentorName = request.mentor
    ? `${request.mentor.first_name} ${request.mentor.last_name}`
    : "Your mentor"

  const suggestedSlotsHtml = await buildSuggestedSlotsHtml(request)

  const payload = {
    logoUrl: siteLogo,
    menteeName: `${request.mentee.first_name} ${request.mentee.last_name}`,
    mentorName,
    topic: request.topic,
    suggestionMessage: request.suggestion_message ?? "",
    suggestedSlotsHtml,
    sessionLink
  }

  await AddToQueue({
    sendingTo: [request.mentee.email],
    event,
    payload,
    withData: true
  })
}
