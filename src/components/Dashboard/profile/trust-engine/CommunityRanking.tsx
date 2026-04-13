"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Card } from "../../../ui/card"
import { Avatar, AvatarFallback } from "../../../ui/avatar"
import { Badge } from "../../../ui/badge"
import { Progress } from "../../../ui/progress"
import { CommunityRankingsData } from "./Constant"
import RankingCard from "@/src/components/communities/RankingCard"
import LeaderboardCard from "@/src/components/communities/LeaderboardCard"

export function CommunityRanking() {
  const currentUserRank = CommunityRankingsData.find((r) => r.isCurrentUser)

  return (
    <div className="space-y-6">
      {/* Current User Ranking Highlight */}
      {currentUserRank && (
        <RankingCard
          currentUserRank={currentUserRank}
          communityTitle="Spark Community"
        />
      )}

      {/* Leaderboard */}
      <LeaderboardCard data={CommunityRankingsData} />

      {/* Insights */}
      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Your Ranking Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              Points to Next Rank
            </p>
            <p className="text-2xl font-bold text-foreground">330</p>
            <p className="text-xs text-muted-foreground mt-1">
              ~5 days at current pace
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              Rank Growth This Month
            </p>
            <p className="text-2xl font-bold text-primary">+2</p>
            <p className="text-xs text-muted-foreground mt-1">
              Moving up steadily
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
