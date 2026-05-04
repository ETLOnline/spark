"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
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
import PaginationComponent from "@/src/components/common/Pagination"
import {
  GetCommunityLeaderboardAction,
  GetCurrentUserRankAction,
  GetUserCommunitiesAction
} from "@/src/server-actions/Communities/CommunityRanking"

const PAGE_SIZE = 5

export function CommunityRanking() {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  )
  const [userCommunities, setUserCommunities] = useState<any[]>([])
  const [leaderboardData, setLeaderboardData] = useState<Ranking[] | null>(null)
  const [userRank, setUserRank] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [communitiesLoading, setCommunitiesLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [communityHasRanking, setCommunityHasRanking] = useState(false)

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setCommunitiesLoading(true)
        const res = await GetUserCommunitiesAction()
        if (res.success && res.data) {
          setUserCommunities(res.data)
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

  const fetchLeaderboard = async (communityId: string, page: number) => {
    setLoading(true)
    try {
      const [leaderboardRes, rankRes] = await Promise.all([
        GetCommunityLeaderboardAction(communityId, page, PAGE_SIZE),
        GetCurrentUserRankAction(communityId)
      ])

      if (leaderboardRes.success && leaderboardRes.data) {
        const formattedData: Ranking[] = leaderboardRes.data.leaderboard.map(
          (item: any) => ({
            ...item,
            isCurrentUser: item.isCurrentUser || false
          })
        )
        setLeaderboardData(formattedData)
        setTotalPages(leaderboardRes.data.totalPages ?? 1)
        setCommunityHasRanking(leaderboardRes.data.total > 0)
      }

      setUserRank(rankRes.success && rankRes.data ? rankRes.data : null)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      setLeaderboardData(null)
      setUserRank(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedCommunityId) return
    setCurrentPage(1)
    fetchLeaderboard(selectedCommunityId, 1)
  }, [selectedCommunityId])

  const handlePageChange = (page: number) => {
    if (!selectedCommunityId) return
    setCurrentPage(page)
    fetchLeaderboard(selectedCommunityId, page)
  }

  const handleCommunityChange = (id: string) => {
    setSelectedCommunityId(id)
    setLeaderboardData(null)
    setUserRank(null)
    setCommunityHasRanking(false)
  }

  const selectedCommunity = userCommunities.find(
    (c) => c.id === selectedCommunityId
  )

  const pointsToNextRank =
    leaderboardData && userRank
      ? (() => {
          const nextRankUser = leaderboardData.find(
            (u) => u.rank === userRank.rank - 1
          )
          return nextRankUser
            ? Math.max(0, nextRankUser.rpPoints - userRank.rpPoints)
            : 0
        })()
      : 0

  const rankGrowth = userRank?.pointsGained || 0

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Community Selector */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm">Select Community</CardTitle>
        </CardHeader>
        <CardContent>
          {communitiesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 w-28 sm:w-full">
                <Select
                  value={selectedCommunityId || ""}
                  onValueChange={handleCommunityChange}
                >
                  <SelectTrigger className="w-full overflow-hidden gap-2 [&>span:first-child]:min-w-0 [&>span:first-child]:max-w-full [&>span:first-child]:truncate [&>span:last-child]:shrink-0 [&>svg:last-child]:flex-shrink-0">
                    <SelectValue
                      placeholder="Choose a community..."
                      className="block w-full max-w-full truncate"
                    />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-4rem)]">
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

      {/* User Rank Card */}
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : selectedCommunityId ? (
        <RankingCard
          currentUserRank={userRank}
          communityTitle={selectedCommunity?.title}
          noRankMessage="You haven't contributed yet to earn a rank in this community."
        />
      ) : null}

      {/* Leaderboard + Pagination */}
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : !communityHasRanking ? (
        <Card className="p-4 sm:p-6">
          <p className="text-sm font-medium text-muted-foreground text-center">
            This community doesn't have any rankings yet. Be the first to earn
            points!
          </p>
        </Card>
      ) : leaderboardData && leaderboardData.length > 0 ? (
        <Card className="space-y-3 overflow-hidden">
          <LeaderboardCard data={leaderboardData} />
          {totalPages > 1 && (
            <div className="overflow-x-auto">
              <PaginationComponent
                pagination={{
                  page: currentPage,
                  totalPages,
                  total: 0,
                  limit: PAGE_SIZE
                }}
                onPageChange={handlePageChange}
                compactOnMobile={true}
              />
            </div>
          )}
        </Card>
      ) : null}

      {/* Insights */}
      {userRank && selectedCommunityId && (
        <Card className="overflow-hidden p-4 sm:p-6">
          <h4 className="font-semibold text-foreground mb-4">
            Your Ranking Insights
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Points to Next Rank
              </p>
              <p className="text-2xl font-bold text-foreground">
                {pointsToNextRank}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {userRank.rank > 1
                  ? `Until rank ${userRank.rank - 1}`
                  : "You're at the top!"}
              </p>
            </div>
            {/* commenting becuase we will do in the future */}
            {/* <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Latest Points Gained
              </p>
              <p
                className={`text-2xl font-bold ${rankGrowth > 0 ? "text-green-600" : "text-muted-foreground"}`}
              >
                {rankGrowth > 0 ? "+" : ""}
                {rankGrowth}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {rankGrowth > 0 ? "Keep up the momentum!" : "No points yet"}
              </p>
            </div> */}
          </div>
        </Card>
      )}
    </div>
  )
}
