"use server"

import {
  getCommunityLeaderboard,
  getCommunitiesByIds,
  upsertLeaderboardSnapshot
} from "@/src/db/data-access/communities/query"
import { GetActivityRule } from "@/src/db/data-access/reward/query"
import { db } from "@/src/db"
import {
  communitiesTable,
  pointLedgerTable,
  leaderboardSnapshotsTable
} from "@/src/db/schema"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { sql, and, eq } from "drizzle-orm"
import { CreateServerAction } from ".."

export const UpdateCommunityLeaderboardAction = CreateServerAction(
  false,
  async () => {
    try {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      const snapshot_datetime = now.toISOString() // Full timestamp with time

      // Get all communities
      const communities = await db
        .select({ id: communitiesTable.id })
        .from(communitiesTable)

      const processedCommunities = []

      for (const community of communities) {
        // Get activity rule for RP points
        const reputationRule = await GetActivityRule({
          action_type: ActivityTypes.TaskCompletion
        })

        if (!reputationRule?.reward_id) {
          console.log(
            `No activity rule found for TaskCompletion in community ${community.id}`
          )
          continue
        }

        // Fetch all point ledger entries for this community
        const communityPointsRaw = await db
          .select({
            user_id: pointLedgerTable.user_id,
            total_points: sql<number>`CAST(SUM(${pointLedgerTable.amount}) AS INTEGER)`
          })
          .from(pointLedgerTable)
          .where(
            sql`${pointLedgerTable.metadata}->>'community_id' = ${community.id} AND ${pointLedgerTable.reward_id} = ${reputationRule.reward_id}`
          )
          .groupBy(pointLedgerTable.user_id)
          .orderBy(sql`SUM(${pointLedgerTable.amount}) DESC`)

        // Get last snapshot (most recent one, any time before now)
        const lastSnapshot = await db
          .select()
          .from(leaderboardSnapshotsTable)
          .where(eq(leaderboardSnapshotsTable.community_id, community.id))
          .orderBy(sql`${leaderboardSnapshotsTable.snapshot_datetime} DESC`)
          .limit(1)

        const lastSnapshotDate = lastSnapshot[0]?.snapshot_date || null
        const previousLeaderboard = lastSnapshotDate
          ? await getCommunityLeaderboard(community.id, 1000, lastSnapshotDate)
          : []

        // Create a map for quick lookup of previous ranks
        const previousRanks = new Map(
          previousLeaderboard.map((entry, idx) => [
            entry.user_id,
            { rank: idx + 1, points: entry.points }
          ])
        )

        // Create new snapshot for today
        const updatedSnapshots = []

        for (let idx = 0; idx < communityPointsRaw.length; idx++) {
          const { user_id, total_points } = communityPointsRaw[idx]
          const currentRank = idx + 1
          const previousRankData = previousRanks.get(user_id)
          const previousRank = previousRankData?.rank || null
          const previousPoints = previousRankData?.points || total_points // If no previous, assume same points (no gain)

          // Calculate points gained (difference from yesterday)
          const pointsGained = total_points - previousPoints

          // Calculate rank change and trend
          let trend: "up" | "down" | "neutral" = "neutral"
          let rankChange = 0

          if (previousRank !== null) {
            rankChange = previousRank - currentRank // Positive = moved up, Negative = moved down
            if (rankChange > 0) {
              trend = "up"
            } else if (rankChange < 0) {
              trend = "down"
            } else {
              trend = "neutral"
            }
          } else {
            // First time in leaderboard
            trend = "neutral"
            rankChange = 0
          }

          // Upsert snapshot
          await upsertLeaderboardSnapshot({
            community_id: community.id,
            user_id,
            reward_id: reputationRule.reward_id,
            rank: currentRank,
            points: total_points,
            points_gained: Math.max(pointsGained, 0), // Only store positive gains
            trend,
            rank_change: rankChange,
            snapshot_date: today,
            snapshot_datetime: snapshot_datetime
          })

          updatedSnapshots.push({
            rank: currentRank,
            user_id,
            points: total_points,
            trend,
            rankChange
          })
        }

        processedCommunities.push({
          community_id: community.id,
          users_ranked: updatedSnapshots.length,
          snapshot_date: today
        })
      }

      return {
        success: true,
        data: {
          processedCommunities,
          timestamp: today
        }
      }
    } catch (error) {
      console.error("Error updating community leaderboard:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
)
