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
        deep_link: createAbsoluteUrl(`/mentors`),
        icon: request.mentor?.profile_url || ""
      }
    })
  } catch (error) {
    console.error("Error sending mentor slot suggestion notification:", error)
  }
}
