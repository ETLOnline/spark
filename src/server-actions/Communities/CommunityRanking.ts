"use server"

import {
  getCommunityLeaderboard,
  getCurrentUserRank,
  GetCommunityById,
  GetCommunityBySlug,
  getUserTopCommunityRank,
  getUserCommunitiesWithRanking
} from "@/src/db/data-access/communities/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"

export const GetCommunityLeaderboardAction = CreateServerAction(
  true,
  async (
    communityId: string,
    page: number = 1,
    limit: number = 5,
    targetUserId?: string
  ) => {
    try {
      const authUser = await AuthUserAction()
      const highlightUserId = targetUserId ? targetUserId : authUser?.unique_id
      if (!communityId) {
        return { success: false, error: "Community ID is required" }
      }

      const community = await GetCommunityById(communityId)
      if (!community) {
        return { success: false, error: "Community not found" }
      }

      const offset = (page - 1) * limit
      const { data, total } = await getCommunityLeaderboard(
        communityId,
        limit,
        offset
      )

      const formattedLeaderboard = data.map((entry) => ({
        rank: entry.rank,
        name: entry.user
          ? `${entry.user.first_name} ${entry.user.last_name}`.trim()
          : "Unknown",
        avatar: `${entry.user?.first_name?.[0] || "U"}${entry.user?.last_name?.[0] || ""}`,
        rpPoints: entry.points,
        growth: entry.rank_change || 0,
        pointsGained: entry.points_gained || 0,
        isCurrentUser: highlightUserId === entry.user_id,
        trend: (entry.trend || "neutral") as "up" | "down" | "neutral"
      }))

      return {
        success: true,
        data: {
          leaderboard: formattedLeaderboard,
          community,
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page
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
  async (communityId: string, targetUserId?: string) => {
    try {
      const authUser = await AuthUserAction()
      const userId = targetUserId ? targetUserId : authUser?.unique_id
      if (!userId) {
        return { success: false, error: "User not authenticated" }
      }

      if (!communityId) {
        return { success: false, error: "Community ID is required" }
      }

      // Get user's current rank
      const rankData = await getCurrentUserRank(userId, communityId)

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
        pointsGained: rankData.points_gained || 0,
        pointsToNextRank: rankData.pointsToNextRank ?? 0
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

export const GetUserCommunitiesAction = CreateServerAction(
  true,
  async (targetUserId?: string) => {
    try {
      const authUser = await AuthUserAction()
      const userId = targetUserId ? targetUserId : authUser?.unique_id
      if (!userId) {
        return { success: false, error: "User not authenticated" }
      }

      // Fetch communities the user is part of
      const communities = await getUserCommunitiesWithRanking(userId)

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
  }
)

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

export const GetUserTopCommunityRankAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      const topRank = await getUserTopCommunityRank(userId)

      if (!topRank) {
        return { success: true, data: null }
      }

      return {
        success: true,
        data: {
          rank: topRank.rank,
          community_id: topRank.community_id,
          community_title: topRank.community_title,
          points: topRank.points
        }
      }
    } catch (error) {
      console.error("Error fetching user top community rank:", error)
      return { success: false, error: "Failed to fetch top community rank" }
    }
  }
)
