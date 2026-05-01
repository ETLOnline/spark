"use client"

import React, { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import { Skeleton } from "@/src/components/ui/skeleton"
import LeaderboardCard, {
  Ranking
} from "@/src/components/communities/LeaderboardCard"
import RankingCard from "@/src/components/communities/RankingCard"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import {
  GetCommunityLeaderboardAction,
  GetCurrentUserRankAction,
  GetCommunityIdBySlugAction
} from "@/src/server-actions/Communities/CommunityRanking"

interface CommunityRankingPageProps {
  params: Promise<{
    "community-slug": string
  }>
}

export default function CommunityRankingPage({
  params
}: CommunityRankingPageProps) {
  const [slug, setSlug] = useState<string>("")
  const [leaderboardData, setLeaderboardData] = useState<Ranking[]>([])
  const [communityHasRanking, setCommunityHasRanking] = useState<
    boolean | null
  >(null)
  const [userRank, setUserRank] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const { "community-slug": resolvedSlug } = await params
        setSlug(resolvedSlug)

        const communityRes = await GetCommunityIdBySlugAction(resolvedSlug)
        if (!communityRes.success || !communityRes.data) {
          setCommunityHasRanking(false)
          return
        }

        const communityId = communityRes.data

        const [leaderboardRes, rankRes] = await Promise.all([
          GetCommunityLeaderboardAction(communityId, 1, 10),
          GetCurrentUserRankAction(communityId)
        ])

        if (leaderboardRes.success && leaderboardRes.data) {
          setLeaderboardData(leaderboardRes.data.leaderboard)
          setCommunityHasRanking(leaderboardRes.data.total > 0)
        } else {
          setCommunityHasRanking(false)
        }

        setUserRank(rankRes.success && rankRes.data ? rankRes.data : null)
      } catch (error) {
        console.error("Error fetching community ranking:", error)
        setCommunityHasRanking(false)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [params])

  if (loading || communityHasRanking === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (communityHasRanking === false) {
    return (
      <NoDataCard
        title="No rankings yet"
        description="This community doesn't have any leaderboard data yet. Be the first to earn points!"
        icon={<Trophy className="h-12 w-12 text-muted-foreground mb-2" />}
      />
    )
  }

  return (
    <div className="space-y-6">
      <RankingCard
        currentUserRank={userRank}
        communityTitle={slug}
        noRankMessage="You haven't contributed yet to earn a rank in this community."
      />
      <LeaderboardCard data={leaderboardData} />
    </div>
  )
}
