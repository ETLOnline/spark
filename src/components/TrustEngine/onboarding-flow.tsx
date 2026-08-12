"use client"

import { useEffect, useState } from "react"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import {
  CheckCircle,
  Target,
  Award,
  Users,
  ArrowRight,
  Sparkles,
  Trophy
} from "lucide-react"
import { SelectActivityRules } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetActivityRulesAction } from "@/src/server-actions/Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { TrustEngineDetails } from "./TrustEngineDetails"

// Which activity types to feature in onboarding, with friendly labels
const FEATURED_ACTIVITIES: { type: ActivityTypes; label: string }[] = [
  { type: ActivityTypes.ProfileComplete, label: "Complete Your Profile" },
  { type: ActivityTypes.SocialPost, label: "Share Your First Post" },
  { type: ActivityTypes.PeerReview, label: "Help Another Member" },
  { type: ActivityTypes.MilestoneApproval, label: "Complete a Milestone" },
  { type: ActivityTypes.TaskCompletionVerification, label: "Get Task Verified" }
]

function formatReward(
  rule: SelectActivityRules & { reward?: { display_name: string } | null }
) {
  const currency = rule.reward?.display_name ?? "Points"
  return `+${rule.base_points} ${currency}`
}

export function OnboardingFlow({ onFinish }: { onFinish?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [rewardRows, setRewardRows] = useState<
    { label: string; reward: string }[]
  >([])

  const [, , , getActivityRules] = useServerAction(GetActivityRulesAction)

  useEffect(() => {
    const fetchData = async () => {
      const rulesRes = await getActivityRules()

      if (rulesRes?.success && rulesRes.data) {
        const rulesMap = new Map(
          rulesRes.data.map((r: any) => [r.action_type, r])
        )
        const rows = FEATURED_ACTIVITIES.flatMap(({ type, label }) => {
          const rule = rulesMap.get(type)
          if (!rule) return []
          return [{ label, reward: formatReward(rule) }]
        })
        setRewardRows(rows)
      }
    }
    fetchData()
  }, [])

  const steps = [
    {
      icon: Target,
      title: "Welcome to SPARK Trust System",
      description: "Your reputation and achievements matter",
      content: <TrustEngineDetails section="intro" />
    },
    {
      icon: Award,
      title: "Earn & Build Your Reputation",
      description: "Every action counts toward your progression",
      content: <TrustEngineDetails section="earn" />
    },
    {
      icon: Users,
      title: "Progress Through Levels",
      description: "Unlock new opportunities as you grow",
      content: <TrustEngineDetails section="levels" />
    },
    {
      icon: Target,
      title: "You're All Set!",
      description: "Start building your reputation today",
      content: (
        <div className="space-y-4 text-center">
          <div className="space-y-4">
            <div className="p-8 border rounded-lg">
              <div className="inline-block p-4 bg-primary rounded-full mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">
                Ready to Start
              </h4>
              <p>
                Complete your profile to earn your first{" "}
                {rewardRows.find((r) => r.label === "Complete Your Profile")
                  ?.reward ?? "points"}
                !
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-bold text-foreground mb-3">
                Quick Start Actions:
              </p>
              <ul className="text-sm  space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Complete your profile
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Join a community
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Share your first post
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const CurrentIcon = currentStepData.icon

  const handleComplete = () => {
    if (onFinish) {
      onFinish()
      return
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Get Started with SPARK
          </h2>
          <Badge variant="secondary">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress
          value={((currentStep + 1) / steps.length) * 100}
          className="h-2"
        />
      </div>

      {/* Step Content */}
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 text-primary rounded-lg mb-4">
            <CurrentIcon className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            {currentStepData.title}
          </h3>
          <p>{currentStepData.description}</p>
        </div>

        <div className="mb-8">{currentStepData.content}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button
              className="flex-1 flex items-center gap-2"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              className="flex-1 flex items-center gap-2"
              onClick={handleComplete}
            >
              <Sparkles className="w-4 h-4" />
              Complete Onboarding
            </Button>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mt-6 justify-center">
          {steps.map((_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`transition-all ${
                index === currentStep
                  ? "bg-primary w-6 h-1 rounded-full"
                  : "bg-muted w-2 h-2 rounded-full"
              } cursor-pointer hover:bg-primary/70`}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
