import { SendSystemNotification } from "../../system-notification/SystemNotification.utils"
import { AddToQueue } from "../../queue/addToQueue"
import { NotificationEvent } from "../types/events"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"

export interface MilestoneManagerRecipient {
  unique_id: string
  email: string
}

export interface MilestoneDoneContext {
  milestoneName: string
  studentId: string
  studentName: string
  spaceName: string
  deepLink: string
}

/** In-app + email notification to space users: student marked milestone as Complete (Pending Verification). */
export async function notifyManagersMilestoneDone(
  recipients: MilestoneManagerRecipient[],
  ctx: MilestoneDoneContext
) {
  if (!recipients.length) return

  // In-app
  await SendSystemNotification({
    user_id: ctx.studentId,
    receivers: recipients.map((r) => r.unique_id),
    template: {
      title: "Milestone Complete (Pending Verification)",
      body: `${ctx.studentName} marked "${ctx.milestoneName}" as Complete (Pending Verification).`,
      deep_link: ctx.deepLink
    }
  })

  // Email
  const emails = recipients.map((r) => r.email).filter(Boolean)
  if (!emails.length) return

  await AddToQueue({
    sendingTo: emails,
    event: NotificationEvent.MILESTONE_COMPLETED_PENDING_VERIFICATION,
    payload: {
      logoUrl: getSiteLogoUrl(),
      studentName: ctx.studentName,
      milestoneName: ctx.milestoneName,
      spaceName: ctx.spaceName,
      ctaLink: createAbsoluteUrl(ctx.deepLink)
    },
    withData: true
  })
}
