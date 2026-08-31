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

/** In-app + email notification to advisors/admins: student submitted milestone for review. */
export async function notifyManagersMilestoneDone(
  managers: MilestoneManagerRecipient[],
  ctx: MilestoneDoneContext
) {
  if (!managers.length) return

  // In-app
  await SendSystemNotification({
    user_id: ctx.studentId,
    receivers: managers.map((m) => m.unique_id),
    template: {
      title: "Milestone ready for verification",
      body: `${ctx.studentName} submitted "${ctx.milestoneName}" for review.`,
      deep_link: ctx.deepLink
    }
  })

  // Email
  const emails = managers.map((m) => m.email).filter(Boolean)
  if (!emails.length) return

  await AddToQueue({
    sendingTo: emails,
    event: NotificationEvent.MILESTONE_DONE_PENDING,
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
