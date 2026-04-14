import React, { Dispatch, SetStateAction } from "react"
import { Trophy, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"
import { LinkAsButton } from "../../LinkAsButton/LinkAsButton"
import { ScrollArea } from "../../ui/scroll-area"

interface LevelUpModalProps {
  title?: string
  description?: string
  rewardAmount: number
  rewardLabel?: string
  levelName: string
  levelIconId?: string
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
  levelIconId = "1",
  setIsOpen
}: LevelUpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Gradient Header */}
      <DialogContent className="p-0 overflow-visible border-none bg-[#000000000] w-full [&>button]:hidden">
        <div className="absolute z-1 w-full">
          <img
            src="/images/rewards/levels/compressed/paper-scroll.png"
            className="relative h-full w-full -top-[120px] "
            alt=""
          />
        </div>
        <DialogHeader className=" px-10 pt-4 items-center bg-[#000000000] relative z-2 ">
          <DialogClose className="absolute top-6 right-12 text-black">
            <X className="w-5 h-5" />
          </DialogClose>
          <div className="relative h-32 w-32 flex justify-center align-middle ">
            <img
              src={`/images/rewards/levels/compressed/level-${levelIconId}.png`}
              className="w-full h-full absolute animate-[ping_1.2s_linear_infinite] opacity-50"
              alt=""
            />
            <img
              src={`/images/rewards/levels/compressed/level-${levelIconId}.png`}
              className="w-32 h-32 absolute top-0"
              alt=""
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-card ">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-card ">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Content Section */}
        <div className="space-y-6 px-14 relative z-2">
          {/* Reward Box */}
          <div className="rounded-lg  p-4 text-center spark-gradient-panel-bg ">
            <p className="text-xs font-semibold uppercase tracking-wide ">
              Level Unlocked
            </p>
            <p className=" bg-clip-text text-transparent bg-gradient-to-r from-card to-primary/100 text-2xl font-bold ">
              {levelName}
            </p>
            <p className="text-sm ">
              {rewardLabel} +{rewardAmount}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center items-center ">
            <LinkAsButton
              className="flex font-semibold w-fit bg-black hover:bg-black/90 text-white"
              href="/profile"
              onClick={() => setIsOpen(false)}
            >
              Go to Profile
            </LinkAsButton>
          </div>

          {/* Share CTA */}
          <p className="pt-2 text-center text-xs text-black/60">
            Share your achievement with the community
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LevelUpModal
