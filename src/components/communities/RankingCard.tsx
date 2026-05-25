import React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"

type UserRank = {
  rank: number
  rpPoints: number
  trend?: "up" | "down" | "neutral"
  change?: number
  pointsGained?: number
  noRankMessage?: string
}

interface RankingCardProps {
  currentUserRank?: UserRank | null
  communityTitle?: string
  handleClick?: () => void
  grandient?: boolean
  noRankMessage?: string
  displayName?: string
}

const RankingCard: React.FC<RankingCardProps> = ({
  currentUserRank,
  communityTitle,
  handleClick,
  grandient,
  noRankMessage,
  displayName
}) => {
  const possessive = displayName ? `${displayName}'s` : "Your"
  const subject = displayName ?? "You"
  const subjectAux = displayName ? "doesn't" : "don't"

  if (!currentUserRank) {
    return (
      <Card
        className={`w-full overflow-hidden p-4 border-primary/20 ${grandient ? "spark-gradient-panel-bg" : ""}`}
      >
        <p className="text-sm text-muted-foreground mb-1">
          {possessive} Ranking
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          {noRankMessage ??
            `${subject} ${subjectAux} have a rank yet. Start contributing to earn points!`}
        </p>
        {handleClick && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={handleClick}
          >
            View Leaderboard
          </Button>
        )}
      </Card>
    )
  }

  const hasTrend =
    currentUserRank.trend !== "neutral" &&
    currentUserRank.pointsGained !== undefined

  return (
    <Card
      className={`w-full overflow-hidden p-4 sm:p-6 border-primary/20 ${grandient ? "spark-gradient-panel-bg" : ""} ${handleClick ? "hover:cursor-pointer" : ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground mb-2">
            {possessive} Ranking
          </p>
          <div className="flex items-center gap-3">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 shrink-0">
              #{currentUserRank.rank}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {communityTitle}
              </h4>
              <p className="text-sm text-muted-foreground">
                {currentUserRank.rpPoints.toLocaleString()} RP
              </p>
            </div>
          </div>
        </div>

        {hasTrend && (
          <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 sm:text-center">
            <div className="flex items-center gap-1">
              {currentUserRank.trend === "up" && (
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              )}
              {currentUserRank.trend === "down" && (
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              )}
              <span
                className={`text-base sm:text-lg font-bold ${
                  currentUserRank.trend === "up"
                    ? "text-green-600"
                    : currentUserRank.trend === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {currentUserRank.pointsGained! > 0 ? "+" : ""}
                {currentUserRank.pointsGained}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">points gained</p>
          </div>
        )}
      </div>

      {handleClick && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={handleClick}
        >
          View Leaderboard
        </Button>
      )}
    </Card>
  )
}

export default RankingCard
