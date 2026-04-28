"use client"

import { useEffect, useState } from "react"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import {
  onboardingRewardData,
  onboardingLevelData
} from "@/src/utils/constants"
import {
  CheckCircle,
  Target,
  Award,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Trophy
} from "lucide-react"
import { SelectRewardLevel } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { getRewardLevelsAction } from "@/src/server-actions/Reward/Reward"

export function OnboardingFlow({ onFinish }: { onFinish?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [levels, setLevels] = useState<SelectRewardLevel[]>([])

  const [getLevelsLoading, , , getLevels] = useServerAction(
    getRewardLevelsAction
  )

  useEffect(() => {
    const fetchLevels = async () => {
      const res = await getLevels()
      if (res?.success && res?.data) setLevels(res.data)
    }
    fetchLevels()
  }, [])

  const steps = [
    {
      icon: Target,
      title: "Welcome to SPARK Trust System",
      description: "Your reputation and achievements matter",
      content: (
        <div className="space-y-4">
          <p>
            Every action you take contributes to your reputation in the
            community. We track two key metrics to measure your growth:
          </p>
          <div className="space-y-3">
            <div className="p-4  border  rounded-lg">
              <h4 className="font-semibold  flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                Reputation Points (RP)
              </h4>
              <p className="text-sm">
                Earned through learning, contribution, and community engagement.
                Unlocks advanced opportunities.
              </p>
            </div>
            <div className="p-4  border  rounded-lg">
              <h4 className="font-semibold  flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                Spark Credits (SC)
              </h4>
              <p className="text-sm">
                Earned through milestones and achievements. Spend them on
                premium courses and mentorship.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Award,
      title: "Earn & Build Your Reputation",
      description: "Every action counts toward your progression",
      content: (
        <div className="space-y-4">
          <p>Get rewarded for meaningful contributions:</p>
          <div className="space-y-2">
            {onboardingRewardData.map((item, i) => (
              <div
                key={i}
                className={`p-3 border rounded-lg flex items-center justify-between`}
              >
                <span className="text-sm font-medium">{item.action}</span>
                <span className="text-sm">{item.reward}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: Users,
      title: "Progress Through Levels",
      description: "Unlock new opportunities as you grow",
      content: (
        <div className="space-y-4">
          <p>
            As you accumulate reputation, you'll progress through distinct
            levels, each unlocking new opportunities:
          </p>
          <div className="space-y-3">
            {levels.map((item, i) => (
              <div
                key={i}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{item.name}</Badge>
                    <span className="text-xs">
                      {item.min_points} - {item.max_points} RP
                    </span>
                  </div>
                  <p className="text-sm">{item.description}</p>
                </div>
                <img
                  src={`/images/rewards/levels/compressed/level-${item.id ?? 1}.png`}
                  className=" w-12 h-12"
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>
      )
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
                Complete your profile to earn your first 50 reputation points!
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium text-foreground mb-3">
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
