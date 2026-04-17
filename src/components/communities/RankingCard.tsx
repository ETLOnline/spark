import React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Card } from "../ui/card"

type UserRank = {
  rank: number
  rpPoints: number
  trend?: "up" | "down" | "neutral"
  change?: number // e.g. +2, -1
  pointsGained?: number // Points gained since yesterday
}

interface RankingCardProps {
  currentUserRank?: UserRank | null
  communityTitle?: string
  handleClick?: () => void
}

const RankingCard: React.FC<RankingCardProps> = ({
  currentUserRank,
  communityTitle,
  handleClick
}) => {
  if (!currentUserRank) return null

  return (
    <Card
      onClick={handleClick}
      className="p-6 hover:cursor-pointer border-primary/20"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Your Ranking</p>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-green-600">
              #{currentUserRank.rank}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                {communityTitle}
              </h4>
              <p className="text-sm text-muted-foreground">
                {currentUserRank.rpPoints.toLocaleString()} RP
              </p>
            </div>
          </div>
        </div>
        {currentUserRank.trend !== "neutral" &&
          currentUserRank.pointsGained !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {currentUserRank.trend === "up" && (
                  <ArrowUp className="w-5 h-5 text-green-600" />
                )}
                {currentUserRank.trend === "down" && (
                  <ArrowDown className="w-5 h-5 text-red-600" />
                )}
                <span
                  className={`text-lg font-bold ${
                    currentUserRank.trend === "up"
                      ? "text-green-600"
                      : currentUserRank.trend === "down"
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {currentUserRank.pointsGained > 0 ? "+" : ""}
                  {currentUserRank.pointsGained}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">points gained</p>
            </div>
          )}
      </div>
    </Card>
  )
}

export default RankingCard
