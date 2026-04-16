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
  levelIconId = "1",
  setIsOpen
}: LevelUpModalProps) {
  return (
    <Dialog open={true} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none  w-full max-w-sm [&>button]:hidden overflow-visible">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-primary via-primary/40 to-purple-500">
          <div className="rounded-2xl bg-card overflow-hidden">
            <div className="relative spark-gradient-icon-bg px-6 pt-8 pb-14 flex flex-col items-center gap-3 overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-[-20px] left-[-20px] w-40 h-40 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 rounded-full bg-purple-300/20 blur-2xl" />
              </div>

              <DialogClose className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10">
                <X className="w-5 h-5" />
              </DialogClose>

              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                <Zap className="w-3 h-3 fill-white" />
                Level Up
              </div>

              <div className="relative w-20 h-20 flex items-center justify-center z-10">
                <img
                  src={`/images/rewards/levels/compressed/level-${levelIconId}.png`}
                  className="w-20 h-20 absolute animate-[ping_1.4s_ease-in-out_infinite] opacity-30"
                  alt=""
                />
                <img
                  src={`/images/rewards/levels/compressed/level-${levelIconId}.png`}
                  className="w-20 h-20 relative drop-shadow-2xl"
                  alt={levelName}
                />
              </div>

              <h2 className="text-white text-2xl font-bold text-center z-10 drop-shadow-sm">
                {title}
              </h2>
            </div>
            <div className="relative -mt-8 mx-4 rounded-xl bg-background border border-border shadow-lg px-5 py-4 flex flex-col items-center gap-1 z-10">
              <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 uppercase">
                {"Spark Starter"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm text-foreground font-medium">
                  Level #{levelIconId}
                </span>
              </div>
            </div>

            <div className="px-6 pt-4 pb-6 flex flex-col items-center gap-5">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                {description}
              </p>

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

              <LinkAsButton
                href="/profile/trust-engine"
                onClick={() => setIsOpen(false)}
                className="w-full justify-center spark-gradient-icon-bg text-primary-foreground font-semibold hover:opacity-90 transition-opacity border-0"
              >
                View Trust Dashboard
              </LinkAsButton>

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
