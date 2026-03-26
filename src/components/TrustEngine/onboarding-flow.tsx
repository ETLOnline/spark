"use client"

import { useState } from "react"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
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

export function OnboardingFlow({ onFinish }: { onFinish?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: Target,
      title: "Welcome to SPARK Trust System",
      description: "Your reputation and achievements matter",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Every action you take contributes to your reputation in the
            community. We track two key metrics to measure your growth:
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                Reputation Points (RP)
              </h4>
              <p className="text-sm text-muted-foreground">
                Earned through learning, contribution, and community engagement.
                Unlocks advanced opportunities.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-700 flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                Spark Credits (SC)
              </h4>
              <p className="text-sm text-muted-foreground">
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
          <p className="text-muted-foreground">
            Get rewarded for meaningful contributions:
          </p>
          <div className="space-y-2">
            {[
              {
                action: "Complete Your Profile",
                reward: "+50 RP",
                color: "bg-blue-50"
              },
              {
                action: "Share Your First Post",
                reward: "+30 RP",
                color: "bg-green-50"
              },
              {
                action: "Help Another Member",
                reward: "+20 RP",
                color: "bg-purple-50"
              },
              {
                action: "Complete a Milestone",
                reward: "+150 RP + 50 SC",
                color: "bg-yellow-50"
              },
              {
                action: "Get Skill Verified",
                reward: "+75 RP",
                color: "bg-pink-50"
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`p-3 ${item.color} rounded-lg flex items-center justify-between`}
              >
                <span className="text-sm font-medium text-slate-900">
                  {item.action}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {item.reward}
                </span>
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
          <p className="text-muted-foreground">
            As you accumulate reputation, you'll progress through distinct
            levels, each unlocking new opportunities:
          </p>
          <div className="space-y-3">
            {[
              {
                level: "Spark Starter",
                rp: "0 - 500",
                features: "Basic access, join communities"
              },
              {
                level: "Spark Contributor",
                rp: "500 - 1500",
                features: "Post & comment, find mentors"
              },
              {
                level: "Spark Collaborator",
                rp: "1500 - 3000",
                features: "Lead discussions, advanced projects"
              },
              {
                level: "Spark Leader",
                rp: "3000 - 5000",
                features: "Mentor others, host workshops"
              },
              {
                level: "Spark Champion",
                rp: "5000+",
                features: "Platform leadership, exclusive perks"
              }
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary text-white">{item.level}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.rp} RP
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.features}</p>
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
            <div className="p-8 bg-primary/10 rounded-lg">
              <div className="inline-block p-4 bg-primary text-white rounded-full mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">
                Ready to Start
              </h4>
              <p className="text-muted-foreground">
                Complete your profile to earn your first 50 reputation points!
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-3">
                Quick Start Actions:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
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
          <p className="text-muted-foreground">{currentStepData.description}</p>
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
              className="flex-1 bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
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
