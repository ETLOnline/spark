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
import { LinkAsButton } from "../../LinkAsButton/LinkAsButton"

interface LevelUpModalProps {
  title?: string
  description?: string
  rewardAmount: number
  rewardLabel?: string
  levelName: string
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

function LevelUpModal({
  title = "Achievement Unlocked!",
  description = "Congratulations on leveling up! You've earned a new reward for your continued engagement and contributions.",
  rewardAmount,
  rewardLabel = "Reputation Points",
  levelName,
  isOpen,
  setIsOpen
}: LevelUpModalProps) {
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
              Level Unlocked
            </p>
            <p className="mt-2 text-4xl font-bold ">{levelName}</p>
            <p className="text-sm ">
              {rewardLabel} +{rewardAmount}
            </p>
          </div>

          {/* Action Button */}
          <LinkAsButton
            className="flex-1 font-semibold w-full"
            href="/profile"
            onClick={() => setIsOpen(false)}
          >
            Go to Profile
          </LinkAsButton>

          {/* Share CTA */}
          <p className="text-center text-xs text-gray-500">
            Share your achievement with the community
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LevelUpModal
