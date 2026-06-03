"use client"

import { TrendingUp, Zap, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "../../../ui/button"
import { Card } from "../../../ui/card"
import { Progress } from "../../../ui/progress"

interface TrustOverViewProps {
  rpPoints: number
  scPoints: number
  levelName: string
  levelId: number
  progressPercent: number
  pointsNeeded: number
}

export function TrustOverView({
  rpPoints,
  scPoints,
  levelName,
  levelId,
  progressPercent,
  pointsNeeded
}: TrustOverViewProps) {
  return (
    <div className="space-y-6">
      {rpPoints === 0 && (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <Users className="h-16 w-16 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Join a Community to Start Earning RP
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Get involved in communities, contribute to projects, and build your
            reputation to earn Reputation Points (RP).
          </p>
          <Link href="/communities">
            <Button className="px-6 py-2">Browse Communities</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reputation Points 2
              </p>
              <h3 className="text-3xl font-bold text-primary mt-2">
                {rpPoints.toLocaleString()}
              </h3>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-xs text-muted-foreground">
            Earned through verified contributions
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Spark Credits
              </p>
              <h3 className="text-3xl font-bold text-purple-600 mt-2">
                {scPoints.toLocaleString()}
              </h3>
            </div>
            <Zap className="w-8 h-8 text-purple-600/60" />
          </div>
          <p className="text-xs text-muted-foreground">
            Earned through engagement activities
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Current Level
          </p>
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-2xl font-bold text-foreground mt-1">
              {levelName}
            </h3>
            <img
              src={`/images/rewards/levels/compressed/level-${levelId ?? 1}.png`}
              className=" w-12 h-12"
              alt=""
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Progress to Next Level
            </span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {pointsNeeded.toLocaleString()} points needed
          </p>
        </div>
      </Card>

      {/* For future use */}
      {/* <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">Trust Breakdown</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Profile Completeness
            </span>
            <span className="text-sm font-medium text-foreground">85%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Community Engagement
            </span>
            <span className="text-sm font-medium text-foreground">92%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Skill Verification
            </span>
            <span className="text-sm font-medium text-foreground">72%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Project Completion
            </span>
            <span className="text-sm font-medium text-foreground">88%</span>
          </div>
        </div>
      </Card> */}
    </div>
  )
}
