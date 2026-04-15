"use client"

import { Dispatch, SetStateAction } from "react"
import { X, Star, Zap } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "../../ui/dialog"
import { LinkAsButton } from "../../LinkAsButton/LinkAsButton"

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
  levelIconId = "3",
  setIsOpen
}: LevelUpModalProps) {
  return (
    <Dialog open={true} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none w-full max-w-sm [&>button]:hidden overflow-visible">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* ── Outer glow ring ── */}
        <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-primary via-primary/40 to-purple-500">

          {/* ── Card body ── */}
          <div className="rounded-2xl bg-card overflow-hidden">

            {/* ── Header gradient banner ── */}
            <div className="relative spark-gradient-icon-bg px-6 pt-10 pb-16 flex flex-col items-center gap-3 overflow-hidden">

              {/* Background shimmer blobs */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-[-20px] left-[-20px] w-40 h-40 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 rounded-full bg-purple-300/20 blur-2xl" />
              </div>

              {/* Close button */}
              <DialogClose className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
              </DialogClose>

              {/* Zap badge */}
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                <Zap className="w-3 h-3 fill-white" />
                Level Up
              </div>

              {/* Animated level icon */}
              <div className="relative w-28 h-28 flex items-center justify-center z-10">
                <img
                  src={`/images/rewards/levels/level-${levelIconId}.svg`}
                  className="w-28 h-28 absolute animate-[ping_1.4s_ease-in-out_infinite] opacity-30"
                  alt=""
                />
                <img
                  src={`/images/rewards/levels/level-${levelIconId}.svg`}
                  className="w-28 h-28 relative drop-shadow-2xl"
                  alt={levelName}
                />
              </div>

              {/* Title */}
              <h2 className="text-white text-2xl font-bold text-center z-10 drop-shadow-sm">
                {title}
              </h2>
            </div>

            {/* ── Overlap card ── */}
            <div className="relative -mt-8 mx-4 rounded-xl bg-background border border-border shadow-lg px-5 py-4 flex flex-col items-center gap-1 z-10">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                New Level
              </p>
              <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                {levelName}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm text-foreground font-medium">
                  +{rewardAmount} {rewardLabel}
                </span>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="px-6 pt-4 pb-6 flex flex-col items-center gap-5">

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {description}
              </p>

              {/* Reward strip */}
              <div className="w-full rounded-lg spark-gradient-panel-bg border border-primary/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full spark-gradient-icon-bg flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {rewardLabel}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">
                  +{rewardAmount}
                </span>
              </div>

              {/* CTA */}
              <LinkAsButton
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full justify-center spark-gradient-icon-bg text-primary-foreground font-semibold hover:opacity-90 transition-opacity border-0"
              >
                View Trust Dashboard
              </LinkAsButton>

              {/* Footer hint */}
              <p className="text-xs text-muted-foreground">
                Share your achievement with the community
              </p>
            </div>

          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default LevelUpModal
