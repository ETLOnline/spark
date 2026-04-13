"use client"
import {
  SelectPointLedger,
  SelectRewardLevel,
  SelectUserRewardBalance
} from "@/src/db/schema"
import pusherClient from "@/src/services/realtime/PusherClient"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue } from "jotai"
import React, { useEffect, useState } from "react"
import { rewardToast } from "./Hook/UseRewardToastHook"
import { RewardToast } from "./RewardToast"
import LevelUpModal from "./LevelUpModal"

function RewardNotification() {
  const [isRewardModalVisible, setRewardModalVisible] = useState(false)
  const [levelUp, setLevelUp] = useState<{
    levelName: string
    currentUserBalance: number
  } | null>(null)
  const authUser = useAtomValue(userStore.AuthUser)

  useEffect(() => {
    if (!authUser) return

    const channel = pusherClient.subscribe(`user-${authUser?.unique_id}`)

    channel.bind(
      "reward_added",
      ({
        ledgerEntry,
        userRewardBalance
      }: {
        ledgerEntry: SelectPointLedger
        userRewardBalance: SelectUserRewardBalance
      }) => {
        rewardToast({
          title: "Reward Earned!",
          description: `You have earned ${ledgerEntry.amount} points for ${ledgerEntry.rule?.action_display_name}`,
          reward: ledgerEntry.amount
        })
      }
    )

    channel.bind(
      "level_up",
      ({
        newLevel,
        currentUserBalance
      }: {
        newLevel: SelectRewardLevel
        currentUserBalance: number
      }) => {
        setLevelUp({ levelName: newLevel.name, currentUserBalance })
        setRewardModalVisible(true)
      }
    )

    return () => {
      channel.unbind("reward_added")
      channel.unbind("level_up")
    }
  }, [authUser?.unique_id])

  useEffect(() => {
    if (!isRewardModalVisible) setLevelUp(null)
  }, [isRewardModalVisible])

  return (
    <>
      <RewardToast />
      <LevelUpModal
        levelName={levelUp?.levelName || ""}
        rewardAmount={levelUp?.currentUserBalance || 0}
        isOpen={isRewardModalVisible}
        setIsOpen={setRewardModalVisible}
      />
    </>
  )
}

export default RewardNotification
