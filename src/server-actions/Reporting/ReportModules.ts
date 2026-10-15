"use server"

import { CreateServerAction } from ".."
import { GetUsersReportModule } from "@/src/db/data-access/reporting/users/query"
import { GetCommunitiesReportModule } from "@/src/db/data-access/reporting/communities/query"
import { GetMentorshipReportModule } from "@/src/db/data-access/reporting/mentorship/query"
import { GetPostsReportModule } from "@/src/db/data-access/reporting/posts/query"
import { GetRewardsReportModule } from "@/src/db/data-access/reporting/rewards/query"
import { GetEventsReportModule } from "@/src/db/data-access/reporting/events/query"

/**
 * One server action per report module. Only ever called from
 * BuildAdminReportSnapshot (internal orchestration), not from the client —
 * auth is disabled (false) to match, same as GenerateReportSnapshotAction,
 * since there's no Clerk session in that cron-triggered call path.
 */
export const GetUsersReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const data = await GetUsersReportModule()
      return { success: true, data }
    } catch (error) {
      console.error("Error building users report module:", error)
      return { success: false, error }
    }
  }
)

export const GetCommunitiesReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const data = await GetCommunitiesReportModule()
      return { success: true, data }
    } catch (error) {
      console.error("Error building communities report module:", error)
      return { success: false, error }
    }
  }
)

export const GetMentorshipReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const data = await GetMentorshipReportModule()
      return { success: true, data }
    } catch (error) {
      console.error("Error building mentorship report module:", error)
      return { success: false, error }
    }
  }
)

export const GetPostsReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const data = await GetPostsReportModule()
      return { success: true, data }
    } catch (error) {
      console.error("Error building posts report module:", error)
      return { success: false, error }
    }
  }
)

export const GetRewardsReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const data = await GetRewardsReportModule()
      return { success: true, data }
    } catch (error) {
      console.error("Error building rewards report module:", error)
      return { success: false, error }
    }
  }
)

export const GetEventsReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const data = await GetEventsReportModule()
      return { success: true, data }
    } catch (error) {
      console.error("Error building events report module:", error)
      return { success: false, error }
    }
  }
)
