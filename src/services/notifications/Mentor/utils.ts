import { SelectSessionRequest } from "@/src/db/schema"
import { SendSystemNotification } from "../../system-notification/SystemNotification.utils"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"

export const SendMentorSlotSuggestionNotification = async (
  request: SelectSessionRequest
) => {
  try {
    if (!request.mentee) return

    const mentorName = request.mentor
      ? `${request.mentor.first_name} ${request.mentor.last_name}`
      : "Your mentor"

    await SendSystemNotification({
      user_id: request.mentor_id,
      receivers: [request.mentee_id],
      template: {
        title: `${mentorName} suggested new slots`,
        body: `${mentorName} suggested new session slots for "${request.topic}". Please review and respond.`,
        deep_link: createAbsoluteUrl(
          `/profile/${request.mentor_id}/availability`
        ),
        icon: request.mentor?.profile_url || ""
      }
    })
  } catch (error) {
    console.error("Error sending mentor slot suggestion notification:", error)
  }
}

export const SendSlotTimeChangedNotification = async (
  request: SelectSessionRequest,
  newTime: { newDateLabel: string; newStartLabel: string; newEndLabel: string }
) => {
  try {
    if (!request.mentee) return

    const mentorName = request.mentor
      ? `${request.mentor.first_name} ${request.mentor.last_name}`
      : "Your mentor"

    await SendSystemNotification({
      user_id: request.mentor_id,
      receivers: [request.mentee_id],
      template: {
        title: `${mentorName} changed the session time`,
        body: `The time for your pending request on "${request.topic}" changed to ${newTime.newDateLabel} · ${newTime.newStartLabel} – ${newTime.newEndLabel}.`,
        deep_link: createAbsoluteUrl(
          `/profile/${request.mentor_id}/availability`
        ),
        icon: request.mentor?.profile_url || ""
      }
    })
  } catch (error) {
    console.error("Error sending slot time changed notification:", error)
  }
}
