"use client"

import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent } from "@/src/components/ui/card"
import { Dispatch, SetStateAction, useState } from "react"
import { Button } from "../ui/button"
import { SelectUser } from "@/src/db/schema"
import { Controller, useForm } from "react-hook-form"
import { useServerAction } from "@/src/hooks/useServerAction"
import { toast } from "@/src/hooks/use-toast"
import {
  updateUserProfileAction,
  userProfileCompletionAction
} from "@/src/server-actions/profile/profile"
import { socialPlatforms } from "./constants"
interface StepThreeProps {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  user: SelectUser
  setUser: Dispatch<SetStateAction<SelectUser>>
}

export function StepThree({ step, setStep, user, setUser }: StepThreeProps) {
  const [submitDataLoading, , , submitUserProfileData] = useServerAction(
    userProfileCompletionAction
  )
  const [isTransitioning, setIsTransitioning] = useState(false)

  const ReferralId = localStorage.getItem("referral_id")
  const form = useForm({})

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  async function submitData(data: any) {
    setIsTransitioning(true)
    try {
      const socialPlatforms = {
        linkedin_url: data.linkedin,
        github_url: data.github,
        instagram_url: data.instagram,
        twitter_url: data.twitter,
        personal_website_url: data.website
      }
      const hasAnyLink = Object.values(socialPlatforms).some(
        (val) => val && val.trim() !== ""
      )

      const finalData = {
        ...socialPlatforms,
        is_profile_completed: 1
      }

      const res = await submitUserProfileData(
        user.unique_id,
        finalData,
        ReferralId || ""
      )
      console.log("Profile completion response:", res)

      if (res?.success) {
        toast({
          title: hasAnyLink
            ? "Social links added successfully"
            : "Profile data saved successfully",
          duration: 2000
        })
        if (!submitDataLoading) {
          setStep(4) // Go to completion step
        }
      } else {
        setIsTransitioning(false)
      }
    } catch (error) {
      console.error("Error submitting social links:", error)
      toast({
        title: "Failed to save Data",
        variant: "destructive",
        duration: 2000
      })
      setIsTransitioning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Social Links</h3>
        <p className="text-sm text-muted-foreground">
          Connect your social profiles (optional)
        </p>
      </div>

      <div className="grid gap-4">
        <form onSubmit={form.handleSubmit(submitData)}>
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon
            return (
              <Card key={platform.key} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 border rounded-full`}>
                      <IconComponent className={`h-5 w-5`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={platform.key} className="font-semibold">
                        {platform.label}
                      </Label>
                      <Controller
                        name={platform.key}
                        defaultValue=""
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id={platform.key}
                            placeholder={platform.placeholder}
                            type="url"
                            {...field}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {step < 4 && (
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button loading={submitDataLoading} disabled={isTransitioning}>
                Continue
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
