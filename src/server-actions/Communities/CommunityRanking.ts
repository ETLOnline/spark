"use server"

import {
  getCommunityLeaderboard,
  getCurrentUserRank,
  GetCommunityById,
  getUserCommunities,
  GetCommunityBySlug
} from "@/src/db/data-access/communities/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"

export const GetCommunityLeaderboardAction = CreateServerAction(
  true,
  async (communityId: string, limit: number = 10) => {
    try {
      const user = await AuthUserAction()
      if (!communityId) {
        return { success: false, error: "Community ID is required" }
      }

      // Verify community exists
      const community = await GetCommunityById(communityId)
      if (!community) {
        return { success: false, error: "Community not found" }
      }

      // Get leaderboard data
      const leaderboardData = await getCommunityLeaderboard(communityId, limit)

      // Transform for component
      const formattedLeaderboard = leaderboardData.map((entry) => ({
        rank: entry.rank,
        name: entry.user
          ? `${entry.user.first_name} ${entry.user.last_name}`.trim()
          : "Unknown",
        avatar:
          // entry.user?.profile_url ||
          `${entry.user?.first_name?.[0] || "U"}${entry.user?.last_name?.[0] || ""}`,
        rpPoints: entry.points,
        growth: entry.rank_change || 0,
        pointsGained: entry.points_gained || 0,
        isCurrentUser: user?.unique_id === entry.user_id,
        trend: (entry.trend || "neutral") as "up" | "down" | "neutral"
      }))

      return {
        success: true,
        data: {
          leaderboard: formattedLeaderboard,
          community
        }
      }
    } catch (error) {
      console.error("Error fetching community leaderboard:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
)

export const GetCurrentUserRankAction = CreateServerAction(
  true,
  async (communityId: string) => {
    try {
      const user = await AuthUserAction()
      if (!user) {
        return { success: false, error: "User not authenticated" }
      }

      if (!communityId) {
        return { success: false, error: "Community ID is required" }
      }

      // Get user's current rank
      const rankData = await getCurrentUserRank(user.unique_id, communityId)

      if (!rankData) {
        return {
          success: true,
          data: null
        }
      }

      const formattedRank = {
        rank: rankData.rank,
        rpPoints: rankData.points,
        trend: (rankData.trend || "neutral") as "up" | "down" | "neutral",
        change: rankData.rank_change || 0,
        pointsGained: rankData.points_gained || 0
      }

      return {
        success: true,
        data: formattedRank
      }
    } catch (error) {
      console.error("Error fetching user rank:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
)

export const GetUserCommunitiesAction = CreateServerAction(true, async () => {
  try {
    const user = await AuthUserAction()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Fetch communities the user is part of
    const communities = await getUserCommunities(user.unique_id)

    return {
      success: true,
      data: communities || []
    }
  } catch (error) {
    console.error("Error fetching user communities:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
})

export const GetCommunityIdBySlugAction = CreateServerAction(
  false,
  async (slug: string) => {
    try {
      if (!slug) {
        return { success: false, error: "Slug is required" }
      }

      const community = await GetCommunityBySlug(slug)

      if (!community) {
        return { success: false, error: "Community not found" }
      }

      return {
        success: true,
        data: community.id
      }
    } catch (error) {
      console.error("Error fetching community by slug:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
)
