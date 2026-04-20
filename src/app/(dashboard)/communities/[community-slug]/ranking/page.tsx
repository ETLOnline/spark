"use client"

import React, { useEffect, useState } from "react"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { Skeleton } from "@/src/components/ui/skeleton"
import LeaderboardCard, {
  Ranking
} from "@/src/components/communities/LeaderboardCard"
import RankingCard from "@/src/components/communities/RankingCard"
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
  const [communityId, setCommunityId] = useState<string>("")
  const [leaderboardData, setLeaderboardData] = useState<Ranking[] | null>(null)
  const [userRank, setUserRank] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getParams = async () => {
      const { "community-slug": slug } = await params
      setSlug(slug)

      // Fetch communityId from slug
      const res = await GetCommunityIdBySlugAction(slug)
      if (res.success && res.data) {
        setCommunityId(res.data)
      }
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!communityId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [leaderboardRes, rankRes] = await Promise.all([
          GetCommunityLeaderboardAction(communityId, 1, 10),
          GetCurrentUserRankAction(communityId)
        ])

        if (leaderboardRes.success && leaderboardRes.data) {
          const formattedData: Ranking[] = leaderboardRes.data.leaderboard
          setLeaderboardData(formattedData)
        }

        if (rankRes.success && rankRes.data) {
          setUserRank(rankRes.data)
        }
      } catch (error) {
        console.error("Error fetching community ranking:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [communityId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {userRank && (
        <RankingCard currentUserRank={userRank} communityTitle={slug} />
      )}
      {leaderboardData && leaderboardData.length > 0 && (
        <LeaderboardCard data={leaderboardData} />
      )}
    </div>
  )
}
