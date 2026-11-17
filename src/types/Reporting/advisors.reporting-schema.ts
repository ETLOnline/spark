import { z } from "zod"

/**
 * Counts behind the four advisor KPI cards on /admin/analytics/advisors.
 * Only headline numbers live in the snapshot; the advisor and project rows
 * behind each card are queried live by the drill-down pages.
 */
export const AdvisorsReportSchema = z.object({
  // Users holding the advisory.can_receive_advisor_request permission through
  // any of their roles (an advisor is defined by permission, not by role).
  total: z.number(),
  // Advisors assigned (accepted_by on the space's latest advisor request) to
  // at least one FYP space whose project is not completed yet.
  active: z.number(),
  // Advisors whose profile.verified is true.
  verified: z.number(),
  projects: z.object({
    // FYP spaces whose last milestone (highest order_index) is verified.
    completed: z.number()
  })
})

export type AdvisorsReport = z.infer<typeof AdvisorsReportSchema>
