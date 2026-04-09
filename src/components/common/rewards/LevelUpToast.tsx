import React, { Dispatch, SetStateAction } from "react"
import { Trophy, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"

interface LevelUpToastProps {
  title: string
  description: string
  rewardAmount: number
  rewardLabel: string
  earnedFrom: string
  actionLabel: string
  isOpen?: boolean
  setIsOpen?: Dispatch<SetStateAction<boolean>>
}

function LevelUpToast({
  title = "Achievement Unlocked!",
  description = "Congratulations on leveling up! You've earned a new reward for your continued engagement and contributions.",
  rewardAmount = 100,
  rewardLabel = "Reputation Points",
  earnedFrom = "Creating a Post",
  actionLabel = "View My Profile",
  isOpen,
  setIsOpen
}: LevelUpToastProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Gradient Header */}
      <DialogContent className="p-0">
        <DialogHeader className=" spark-gradient-panel-bg px-6 py-4 items-center">
          <Trophy className="mx-auto mb-4 h-12 w-12" />
          <DialogTitle className="text-2xl font-bold ">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Content Section */}
        <div className="space-y-6 px-6 py-4">
          {/* Reward Box */}
          <div className="rounded-lg border p-4 text-center spark-gradient-panel-bg">
            <p className="text-xs font-semibold uppercase tracking-wide">
              Reward Earned
            </p>
            <p className="mt-2 text-4xl font-bold ">+{rewardAmount}</p>
            <p className="text-sm ">{rewardLabel}</p>
          </div>

          {/* Earned From */}
          <div className="flex items-center justify-around text-sm">
            <span className="">Earned from:</span>
            <span className="font-semibold ">{earnedFrom}</span>
          </div>

          {/* Action Button */}
          <Button className="flex-1 font-semibold w-full">{actionLabel}</Button>

          {/* Share CTA */}
          <p className="text-center text-xs text-gray-500">
            Share your achievement with the community
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LevelUpToast
