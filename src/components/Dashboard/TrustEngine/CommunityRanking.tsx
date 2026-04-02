"use client"

import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Badge } from "../../ui/badge"
import { Card } from "../../ui/card"
import { Progress } from "../../ui/progress"
import { ArrowUp, ArrowDown } from "lucide-react"

interface Ranking {
  rank: number
  name: string
  avatar: string
  rpPoints: number
  growth: number
  isCurrentUser: boolean
  trend: "up" | "down" | "neutral"
}

const rankings: Ranking[] = [
  {
    rank: 1,
    name: "Sarah Chen",
    avatar: "SC",
    rpPoints: 4850,
    growth: 245,
    isCurrentUser: false,
    trend: "up"
  },
  {
    rank: 2,
    name: "Alex Johnson",
    avatar: "AJ",
    rpPoints: 4620,
    growth: 120,
    isCurrentUser: false,
    trend: "down"
  },
  {
    rank: 3,
    name: "Usama Tariq",
    avatar: "UT",
    rpPoints: 4290,
    growth: 280,
    isCurrentUser: true,
    trend: "up"
  },
  {
    rank: 4,
    name: "Emma Davis",
    avatar: "ED",
    rpPoints: 4150,
    growth: 85,
    isCurrentUser: false,
    trend: "neutral"
  },
  {
    rank: 5,
    name: "Marco Silva",
    avatar: "MS",
    rpPoints: 3920,
    growth: 180,
    isCurrentUser: false,
    trend: "up"
  }
]

export function CommunityRanking() {
  const currentUserRank = rankings.find((r) => r.isCurrentUser)

  return (
    <div className="space-y-6">
      {/* Current User Ranking Highlight */}
      {currentUserRank && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Your Ranking</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-primary">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    In Web Development Community
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {currentUserRank.rpPoints.toLocaleString()} RP
                  </p>
                </div>
              </div>
            </div>
            {currentUserRank.trend === "up" && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowUp className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">+2</span>
                </div>
                <p className="text-xs text-muted-foreground">from last week</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Leaderboard */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Community Leaderboard
        </h3>

        <div className="space-y-3">
          {rankings.map((ranking, index) => {
            const maxRP = Math.max(...rankings.map((r) => r.rpPoints))
            const percentage = (ranking.rpPoints / maxRP) * 100

            return (
              <div
                key={ranking.rank}
                className={`p-4 rounded-lg border transition-all ${
                  ranking.isCurrentUser
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Rank Badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-300 text-gray-700"
                          : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ranking.rank}
                  </div>

                  {/* Avatar & Name */}
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {ranking.avatar}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {ranking.name}
                      </h4>
                      {ranking.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ranking.rpPoints.toLocaleString()} RP
                    </p>
                  </div>

                  {/* Growth Indicator */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {ranking.trend === "up" && (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    )}
                    {ranking.trend === "down" && (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        ranking.trend === "up"
                          ? "text-green-600"
                          : ranking.trend === "down"
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {ranking.trend !== "neutral" &&
                        (ranking.growth > 0 ? "+" : "-")}
                      {ranking.growth}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress value={percentage} className="h-1.5" />
              </div>
            )
          })}
        </div>
      </Card>

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
