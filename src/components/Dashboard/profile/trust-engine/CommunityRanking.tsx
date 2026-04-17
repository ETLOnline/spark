"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Avatar, AvatarFallback } from "../../../ui/avatar"
import { Badge } from "../../../ui/badge"
import { Progress } from "../../../ui/progress"
import { CommunityRankingsData } from "./Constant"
import RankingCard from "@/src/components/communities/RankingCard"
import LeaderboardCard, {
  Ranking
} from "@/src/components/communities/LeaderboardCard"
import { Skeleton } from "../../../ui/skeleton"
import { Button } from "../../../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../ui/select"
import {
  GetCommunityLeaderboardAction,
  GetCurrentUserRankAction,
  GetUserCommunitiesAction
} from "@/src/server-actions/Communities/CommunityRanking"

export function CommunityRanking() {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  )
  const [userCommunities, setUserCommunities] = useState<any[]>([])
  const [leaderboardData, setLeaderboardData] = useState<Ranking[] | null>(null)
  const [userRank, setUserRank] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [communitiesLoading, setCommunitiesLoading] = useState(true)

  // Fetch user's communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setCommunitiesLoading(true)
        const res = await GetUserCommunitiesAction()
        if (res.success && res.data) {
          setUserCommunities(res.data)
          // Auto-select first community
          if (res.data.length > 0) {
            setSelectedCommunityId(res.data[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching communities:", error)
      } finally {
        setCommunitiesLoading(false)
      }
    }
    fetchCommunities()
  }, [])

  // Fetch leaderboard data when community is selected
  useEffect(() => {
    if (!selectedCommunityId) return

    const fetchLeaderboardData = async () => {
      setLoading(true)
      try {
        const [leaderboardRes, rankRes] = await Promise.all([
          GetCommunityLeaderboardAction(selectedCommunityId, 10),
          GetCurrentUserRankAction(selectedCommunityId)
        ])

        if (leaderboardRes.success && leaderboardRes.data) {
          const formattedData: Ranking[] = leaderboardRes.data.leaderboard.map(
            (item: any) => ({
              ...item,
              isCurrentUser: item.isCurrentUser || false
            })
          )
          setLeaderboardData(formattedData)
        }

        if (rankRes.success && rankRes.data) {
          setUserRank(rankRes.data)
        } else {
          setUserRank(null)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        setLeaderboardData(null)
        setUserRank(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [selectedCommunityId])

  const selectedCommunity = userCommunities.find(
    (c) => c.id === selectedCommunityId
  )
  const currentUserRank = userRank

  // Calculate insights dynamically
  const pointsToNextRank =
    leaderboardData && currentUserRank
      ? (() => {
          const nextRankUser = leaderboardData.find(
            (user) => user.rank === currentUserRank.rank - 1
          )
          return nextRankUser
            ? Math.max(0, nextRankUser.rpPoints - currentUserRank.rpPoints)
            : 0
        })()
      : 0

  const rankGrowth = currentUserRank?.pointsGained || 0

  return (
    <div className="space-y-6">
      {/* Community Selector Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select Community</CardTitle>
        </CardHeader>
        <CardContent>
          {communitiesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedCommunityId || ""}
                  onValueChange={setSelectedCommunityId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a community..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userCommunities.length > 0 ? (
                      userCommunities.map((community: any) => (
                        <SelectItem key={community.id} value={community.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {community.title}
                            </span>
                            {community.category && (
                              <span className="text-xs text-muted-foreground">
                                ({community.category.name})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-communities" disabled>
                        No communities found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedCommunityId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCommunityId(null)}
                  className="px-2"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {userCommunities.length > 0
              ? "Select a community to view your ranking"
              : "You haven't joined any communities yet"}
          </p>
        </CardContent>
      </Card>

      {/* Current User Ranking Highlight */}
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : currentUserRank ? (
        <RankingCard
          currentUserRank={currentUserRank}
          communityTitle={selectedCommunity?.title}
        />
      ) : null}

      {/* Leaderboard */}
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : leaderboardData && leaderboardData.length > 0 ? (
        <LeaderboardCard data={leaderboardData} />
      ) : null}

      {/* Insights */}
      {currentUserRank && selectedCommunityId && (
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4">
            Your Ranking Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Points to Next Rank
              </p>
              <p className="text-2xl font-bold text-foreground">
                {pointsToNextRank}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUserRank.rank > 1
                  ? `Until rank ${currentUserRank.rank - 1}`
                  : "You're at the top!"}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Latest Points Gained
              </p>
              <p
                className={`text-2xl font-bold ${
                  rankGrowth > 0 ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {rankGrowth > 0 ? "+" : ""}
                {rankGrowth}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {rankGrowth > 0 ? "Keep up the momentum!" : "No points yet"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
