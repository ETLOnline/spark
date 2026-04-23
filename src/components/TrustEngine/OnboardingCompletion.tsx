"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Target, Trophy, Sparkles } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetActivityRulesAction } from "@/src/server-actions/Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"

export function OnboardingCompletion({
  redirectTo = "/spark/dashboard",
  buttonLabel = "Finish and Go to Dashboard"
}: {
  redirectTo?: string
  buttonLabel?: string
}) {
  const router = useRouter()
  const [completed, setCompleted] = useState(false)
  const [profileReward, setProfileReward] = useState<{
    points: number
    currency: string
  } | null>(null)

  const [, , , getActivityRules] = useServerAction(GetActivityRulesAction)

  useEffect(() => {
    const fetchProfileRule = async () => {
      const res = await getActivityRules()
      if (res?.success && res.data) {
        const rule = res.data.find(
          (r: any) => r.action_type === ActivityTypes.ProfileComplete
        )
        if (rule) {
          setProfileReward({
            points: rule.base_points,
            currency: rule.reward?.display_name ?? "Points"
          })
        }
      }
    }
    fetchProfileRule()
  }, [])

  const handleComplete = () => {
    setCompleted(true)
    router.push(redirectTo)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Get Started with SPARK
          </h2>
          <Badge variant="secondary">Complete</Badge>
        </div>
      </div>

      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 text-primary rounded-lg mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            You're All Set!
          </h3>
          <p>Start building your reputation today</p>
        </div>

        <div className="mb-8">
          <div className="space-y-4 text-center">
            <div className="animate-in fade-in duration-500 space-y-4">
              <div className="flex justify-center gap-2 text-3xl">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    ✨
                  </div>
                ))}
              </div>
              <div className="p-8 spark-gradient-panel-bg rounded-lg border-2 border-primary/30">
                <div className="inline-block p-4 spark-gradient-icon-bg text-white rounded-full mb-4">
                  <Trophy className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to SPARK, Champion!
                </h4>
                <p className="mb-4 text-gray-500 dark:text-white/70">
                  You've unlocked your Spark Starter badge and earned{" "}
                  {profileReward
                    ? `${profileReward.points} initial ${profileReward.currency}`
                    : "initial points"}
                  . Your journey begins now!
                </p>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-primary/50 dark:border-primary/30">
                    <p className="text-sm font-semibold text-primary">
                      Initial Balance
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {profileReward
                        ? `${profileReward.points} ${profileReward.currency}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="flex-1 flex items-center gap-2"
            onClick={handleComplete}
            disabled={completed}
          >
            {buttonLabel}
          </Button>
        </div>
      </Card>
    </div>
  )
}
