"use client"

import { BarChart3, TrendingUp, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import { ScrollArea } from "../../../ui/scroll-area"
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

interface TrustEngineScreenProps {
  userId?: string
  userName?: string
}

export default function TrustEngineScreen({
  userId,
  userName
}: TrustEngineScreenProps) {
  const authUser = useAtomValue(userStore.AuthUser)
  const targetUserId = userId ?? authUser?.unique_id
  const isViewingOther = targetUserId !== authUser?.unique_id
  const displayName = isViewingOther ? userName : ""

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
      if (!targetUserId) return
      const txRes = await GetUserTransactionsAction(
        targetUserId,
        page,
        PAGE_SIZE
      )
      if (txRes?.success && txRes.data) {
        setTransactions(txRes.data)
        setTotalTransactions(txRes.total ?? 0)
      }
    },
    [targetUserId]
  )

  const fetchAllData = useCallback(async () => {
    if (!targetUserId) return

    const [rpRes, scRes, levelRes] = await Promise.all([
      GetUserRewardBalanceAction(targetUserId, 1),
      GetUserRewardBalanceAction(targetUserId, 2),
      GetUSerRewardLevelAction(targetUserId)
    ])

    if (rpRes?.success && rpRes.data) setRpPoints(rpRes.data.current_balance)
    if (scRes?.success && scRes.data) setScPoints(scRes.data.current_balance)
    if (levelRes?.success && levelRes.data) setUserLevel(levelRes.data)

    await fetchTransactions(1)
  }, [targetUserId, fetchTransactions])

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
    <main className="h-[calc(100svh-8rem)] flex flex-col bg-background pt-6 overflow-hidden px-2">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {displayName ? `${displayName}'s Trust Dashboard` : "Trust Dashboard"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {displayName
            ? `Track ${displayName}'s reputation, achievements, and growth`
            : "Track your reputation, achievements, and growth"}
        </p>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <TabsList className="grid w-full grid-cols-3 gap-2 mb-6 pb-9 sm:pb-10 shrink-0">
          <TabsTrigger
            value="overview"
            className="flex w-full items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-2 sm:px-3"
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex w-full items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-2 sm:px-3"
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Transactions</span>
          </TabsTrigger>
          <TabsTrigger
            value="ranking"
            className="flex w-full items-center justify-center gap-1 sm:gap-2 rounded-lg px-2 py-2 sm:px-3"
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Ranking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="flex-1 overflow-hidden min-h-0"
        >
          <ScrollArea className="h-full sm:pr-3">
            <div className="pb-6 space-y-6">
              <TrustOverView
                rpPoints={rpPoints}
                scPoints={scPoints}
                levelName={userLevel?.rewardLevel?.name ?? "—"}
                levelId={userLevel?.rewardLevel?.id ?? 1}
                progressPercent={progressPercent}
                pointsNeeded={pointsNeeded}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="transactions"
          className="flex-1 overflow-hidden min-h-0"
        >
          <ScrollArea className="h-full sm:pr-2">
            <div className="pb-6">
              <TransactionLedger
                TransactionsData={transactions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ranking" className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full sm:pr-2">
            <div className="pb-6  w-full">
              <CommunityRanking
                userId={targetUserId}
                displayName={displayName}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </main>
  )
}
