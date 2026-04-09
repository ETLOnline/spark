import { Zap } from "lucide-react"
import Link from "next/link"
import { TrustEngineStats } from "./Constant"
import { Card, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetUserRewardBalanceAction,
  GetUSerRewardLevelAction
} from "@/src/server-actions/Reward/Reward"
import {
  SelectRewardLevel,
  SelectUser,
  SelectUserRewardsLevel
} from "@/src/db/schema"

interface TrustEngineCardProps {
  user: SelectUser
}

export default function TrustEngineCard({ user }: TrustEngineCardProps) {
  const currentRp = 7250
  const maxRp = 10000
  const progressPercent = (currentRp / maxRp) * 100

  const [userSCPoints, setUserSCPoints] = useState(0)
  const [userRPPoints, setUserRPPoints] = useState(0)

  const [getUserRewardBalanceLoading, , , GetUserRewardBalance] =
    useServerAction(GetUserRewardBalanceAction)

  const GetUsersSCPoints = async () => {
    try {
      const res = await GetUserRewardBalance(user.unique_id, 1)
      if (res?.success && res?.data) {
        setUserSCPoints(res.data.current_balance)
      } else {
        console.log("Error fetching SC points:", res?.error)
      }
    } catch (error) {
      console.log("Error fetching SC points:", error)
    }
  }

  const GetUsersRPPoints = async () => {
    try {
      const res = await GetUserRewardBalanceAction(user.unique_id, 2)
      if (res?.success && res?.data) {
        setUserRPPoints(res.data.current_balance)
      } else {
        console.log("Error fetching RP points:", res?.error)
      }
    } catch (error) {
      console.log("Error fetching RP points:", error)
    }
  }

  useEffect(() => {
    if (user) {
      GetUsersSCPoints()
      GetUsersRPPoints()
    }
  }, [])

  return (
    <Card className="rounded-xl border p-6 shadow-sm">
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
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Reputation Points */}
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Reputation Points
          </p>
          <p className="mb-1 text-2xl font-bold text-teal-600 dark:text-teal-400">
            {userRPPoints || 0}
          </p>

          {/* Todo: for future */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            +12% this month
          </p> */}
        </div>

        {/* Spark Credits */}
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Spark Credits
          </p>
          <p className="mb-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {userSCPoints || 0}
          </p>

          {/* Todo: for future */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            Available
          </p> */}
        </div>

        {/* Current Level */}
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Current Level
          </p>
          <p className="mb-1 text-xl font-bold text-teal-600 dark:text-teal-400">
            Spark Mentor
          </p>
          {/* Todo: for future */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            Level 4/5
          </p> */}
        </div>

        {/* Community Rank */}
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Community Rank
          </p>
          <p className="mb-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
            #12
          </p>
          {/* Todo: for future */}
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            Top 96%
          </p> */}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Progress to Next Level
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {currentRp.toLocaleString()} / {maxRp.toLocaleString()} RP
          </span>
        </div>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/40 dark:bg-slate-700/40">
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
