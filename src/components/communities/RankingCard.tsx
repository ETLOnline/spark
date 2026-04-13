import React from "react"
import { ArrowUp } from "lucide-react"
import { Card } from "../ui/card"

type UserRank = {
  rank: number
  rpPoints: number
  trend?: "up" | "down" | "neutral"
  change?: number // e.g. +2, -1
}

interface RankingCardProps {
  currentUserRank?: UserRank | null
  communityTitle?: string
}

const RankingCard: React.FC<RankingCardProps> = ({
  currentUserRank,
  communityTitle
}) => {
  if (!currentUserRank) return null

  return (
    <Card className="p-6  border-primary/20">
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
  )
}

export default RankingCard
