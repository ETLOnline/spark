"use server"

import {
  getCommunityLedgerTotals,
  replaceLeaderboardSnapshots
} from "@/src/db/data-access/communities/query"
import { db } from "@/src/db"
import { communitiesTable, InsertLeaderboardSnapshot } from "@/src/db/schema"
import { CreateServerAction } from ".."

export const UpdateCommunityLeaderboardAction = CreateServerAction(
  false,
  async () => {
    const now = new Date()
    const snapshot_date = now.toISOString().split("T")[0]
    const snapshot_datetime = now.toISOString()

    // 1. Fetch all community IDs
    const communities = await db
      .select({ id: communitiesTable.id })
      .from(communitiesTable)

    const processedCommunities = []

    for (const community of communities) {
      const ledgerTotals = await getCommunityLedgerTotals(community.id)

      if (ledgerTotals.length === 0) continue

      const userMap = new Map<
        string,
        { reward_id: number; total_points: number }
      >()

      for (const entry of ledgerTotals) {
        if (!entry.reward_id) continue
        const existing = userMap.get(entry.user_id)
        if (existing) {
          existing.total_points += entry.total_points
        } else {
          userMap.set(entry.user_id, {
            reward_id: entry.reward_id,
            total_points: entry.total_points
          })
        }
      }

      const sorted = [...userMap.entries()].sort(
        ([, a], [, b]) => b.total_points - a.total_points
      )

      const snapshots: InsertLeaderboardSnapshot[] = sorted.map(
        ([user_id, { reward_id, total_points }], idx) => ({
          community_id: community.id,
          user_id,
          reward_id,
          rank: idx + 1,
          points: total_points,
          points_gained: 0,
          trend: "neutral",
          rank_change: 0,
          snapshot_date,
          snapshot_datetime
        })
      )

      await replaceLeaderboardSnapshots(community.id, snapshots)

      processedCommunities.push({
        community_id: community.id,
        users_ranked: snapshots.length,
        snapshot_date
      })
    }

    return {
      success: true,
      data: { processedCommunities, timestamp: snapshot_date }
    }
  }
)
