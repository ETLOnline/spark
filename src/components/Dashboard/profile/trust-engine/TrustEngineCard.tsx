"use client"

import { Zap } from "lucide-react"
import Link from "next/link"
import { Card, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { useCallback, useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetUserRewardBalanceAction,
  GetUSerRewardLevelAction
} from "@/src/server-actions/Reward/Reward"
import { SelectUser, SelectUserRewardsLevel } from "@/src/db/schema"
import pusherClient from "@/src/services/realtime/PusherClient"
import { progressPercentHelper } from "@/src/utils/clientHelper"

interface TrustEngineCardProps {
  user: SelectUser
}

export default function TrustEngineCard({ user }: TrustEngineCardProps) {
  const [userSCPoints, setUserSCPoints] = useState(0)
  const [userRPPoints, setUserRPPoints] = useState(0)
  const [userLevel, setUserLevel] = useState<SelectUserRewardsLevel | null>(
    null
  )

  const [, , , GetUserRewardBalance] = useServerAction(
    GetUserRewardBalanceAction
  )
  const [, , , GetUserRewardLevel] = useServerAction(GetUSerRewardLevelAction)

  const fetchData = useCallback(async () => {
    const [rpRes, scRes, levelRes] = await Promise.all([
      GetUserRewardBalance(user.unique_id, 1),
      GetUserRewardBalance(user.unique_id, 2),
      GetUserRewardLevel(user.unique_id)
    ])

    if (scRes?.success && scRes.data)
      setUserSCPoints(scRes.data.current_balance)
    if (rpRes?.success && rpRes.data)
      setUserRPPoints(rpRes.data.current_balance)
    if (levelRes?.success && levelRes.data) setUserLevel(levelRes.data)
  }, [user.unique_id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const minPoints = userLevel?.rewardLevel?.min_points ?? 0
  const maxPoints = userLevel?.rewardLevel?.max_points ?? 0
  const progressPercent = progressPercentHelper(
    userRPPoints,
    minPoints,
    maxPoints
  )

  return (
    <Card className="rounded-xl border p-6 shadow-sm spark-gradient-panel-bg">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Trust Engine
          </CardTitle>
        </div>

        <Button>
          <Link href="/profile/trust-engine">View DashBoard</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-lg border p-4 bg-card flex flex-col justify-between h-full">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Reputation Points
          </p>
          <p className="mb-1 text-2xl font-bold text-teal-600 dark:text-teal-400">
            {userRPPoints}
          </p>

          {/* Todo: for future */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            +12% this month
          </p> */}
        </div>

        <div className="rounded-lg border p-4 bg-card  flex flex-col justify-between h-full">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Spark Credits
          </p>
          <p className="mb-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {userSCPoints}
          </p>
          {/* Todo: for future */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            Available
          </p> */}
        </div>

        <div className="rounded-lg border p-4 bg-card flex flex-col justify-between h-full relative">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Current Level
          </p>
          <p
            className="mb-1 font-bold text-teal-600 dark:text-teal-400 line-clamp-2 break-words"
            title={userLevel?.rewardLevel?.name ?? "—"}
          >
            {userLevel?.rewardLevel?.name ?? "—"}
          </p>
          <img
            src={`/images/rewards/levels/compressed/level-${userLevel?.rewardLevel?.id ?? 1}.png`}
            className="absolute top-[-14] right-[-14] w-12 h-12"
            alt=""
          />
        </div>

        <div className="rounded-lg border p-4 bg-card flex flex-col justify-between h-full">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Community Rank
          </p>
          <p className="mb-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
            #0
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Progress to Next Level
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {userRPPoints.toLocaleString()} / {maxPoints.toLocaleString()} RP
          </span>
        </div>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-card">
          <div
            className="bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-400 dark:to-blue-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="flex-1 bg-transparent" />
        </div>
      </div>
    </Card>
  )
}
