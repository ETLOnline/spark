import React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Card } from "../ui/card"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"

export type Ranking = {
  rank: number
  name: string
  avatar: string
  rpPoints: number
  growth: number
  pointsGained: number
  isCurrentUser: boolean
  trend: "up" | "down" | "neutral"
}

interface LeaderboardCardProps {
  data: Ranking[]
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ data }) => {
  const maxRP = Math.max(...data.map((r) => r.rpPoints))

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">
        Community Leaderboard
      </h3>

      <div className="space-y-3">
        {data.map((ranking, index) => {
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

                {/* Avatar */}
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

                {/* Points Gained with Trend */}
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
                      (ranking.pointsGained > 0 ? "+" : "")}
                    {ranking.pointsGained > 0
                      ? ranking.pointsGained
                      : ranking.pointsGained === 0
                        ? "—"
                        : ranking.pointsGained}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <Progress value={percentage} className="h-1.5" />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default LeaderboardCard
