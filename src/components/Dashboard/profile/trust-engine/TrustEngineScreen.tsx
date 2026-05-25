"use client"

import { BarChart3, TrendingUp, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import { TransactionLedger } from "./TransactionLedger"
import { CommunityRanking } from "./CommunityRanking"
import { TrustOverView } from "./TrustOverView"
import { useCallback, useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { getFeatureFlagAction } from "@/src/server-actions/FeatureFlag/FeatureFlag"
import NoDataCard from "../../../Dashboard/Channels/ChannelDetails/NoDataCard"
import {
  GetUserRewardBalanceAction,
  GetUSerRewardLevelAction,
  GetUserTransactionsAction
} from "@/src/server-actions/Reward/Reward"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { SelectUserRewardsLevel } from "@/src/db/schema"
import pusherClient from "@/src/services/realtime/PusherClient"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { progressPercentHelper } from "@/src/utils/clientHelper"

export default function TrustEngineScreen() {
  const authUser = useAtomValue(userStore.AuthUser)

  const PAGE_SIZE = 10

  const [isTrustEngineEnabled, setIsTrustEngineEnabled] = useState(false)
  const [isFlagLoading, setIsFlagLoading] = useState(true)
  const [rpPoints, setRpPoints] = useState(0)
  const [scPoints, setScPoints] = useState(0)
  const [userLevel, setUserLevel] = useState<SelectUserRewardsLevel | null>(
    null
  )
  const [transactions, setTransactions] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)

  const [, , , GetFeatureFlag] = useServerAction(getFeatureFlagAction)

  useEffect(() => {
    const checkFlag = async () => {
      const res = await GetFeatureFlag(["Trust_Engine_Enabled"])
      if (res?.success && res?.data?.is_enabled) setIsTrustEngineEnabled(true)
      setIsFlagLoading(false)
    }
    checkFlag()
  }, [])

  const fetchTransactions = useCallback(
    async (page: number) => {
      if (!authUser?.unique_id) return
      const txRes = await GetUserTransactionsAction(
        authUser.unique_id,
        page,
        PAGE_SIZE
      )
      if (txRes?.success && txRes.data) {
        setTransactions(txRes.data)
        setTotalTransactions(txRes.total ?? 0)
      }
    },
    [authUser?.unique_id]
  )

  const fetchAllData = useCallback(async () => {
    if (!authUser?.unique_id) return

    const [rpRes, scRes, levelRes] = await Promise.all([
      GetUserRewardBalanceAction(authUser.unique_id, 1),
      GetUserRewardBalanceAction(authUser.unique_id, 2),
      GetUSerRewardLevelAction(authUser.unique_id)
    ])

    if (rpRes?.success && rpRes.data) setRpPoints(rpRes.data.current_balance)
    if (scRes?.success && scRes.data) setScPoints(scRes.data.current_balance)
    if (levelRes?.success && levelRes.data) setUserLevel(levelRes.data)

    await fetchTransactions(1)
  }, [authUser?.unique_id, fetchTransactions])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  useEffect(() => {
    if (!authUser?.unique_id) return

    const channelName = `user-${authUser.unique_id}`
    const channel = pusherClient.subscribe(channelName)

    const handleRewardAdded = () => {
      fetchAllData()
    }

    channel.bind("reward_added", handleRewardAdded)

    return () => {
      channel.unbind("reward_added", handleRewardAdded)
    }
  }, [authUser?.unique_id])

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage)
    await fetchTransactions(newPage)
  }

  const totalPages = Math.ceil(totalTransactions / PAGE_SIZE)

  const minPoints = userLevel?.rewardLevel?.min_points ?? 0
  const maxPoints = userLevel?.rewardLevel?.max_points ?? 0
  const progressPercent = progressPercentHelper(rpPoints, minPoints, maxPoints)
  const pointsNeeded = maxPoints > rpPoints ? maxPoints - rpPoints : 0

  if (isFlagLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader size={LoaderSizes.xl} />
      </main>
    )
  }

  if (!isTrustEngineEnabled) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <NoDataCard
            title="Feature Disabled"
            description="This feature is currently disabled by the admin."
            icon={<Lock className="h-16 w-16 text-muted-foreground mb-4" />}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Trust Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your reputation, achievements, and growth
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TrustOverView
              rpPoints={rpPoints}
              scPoints={scPoints}
              levelName={userLevel?.rewardLevel?.name ?? "—"}
              levelId={userLevel?.rewardLevel?.id ?? 1}
              progressPercent={progressPercent}
              pointsNeeded={pointsNeeded}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionLedger
              TransactionsData={transactions}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </TabsContent>

          <TabsContent value="ranking">
            <CommunityRanking />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
