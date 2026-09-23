"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { updateUserProfileAction } from "@/src/server-actions/profile/profile"
import { useToast } from "@/src/hooks/use-toast"
import Link from "next/link"

interface StepFiveProps {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  user: SelectUser
  totalSteps?: number
}

export function StepFive({
  step,
  setStep,
  user,
  totalSteps = 6
}: StepFiveProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, , , updateProfile] = useServerAction(updateUserProfileAction)
  const { toast } = useToast()

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleContinue = async () => {
    if (!acknowledged) return
    const res = await updateProfile(user.unique_id, { coc_acknowledged: true })
    if (res?.success) {
      setStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    } else {
      toast({
        title: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Code of Conduct</h3>
        <p className="text-sm text-muted-foreground">
          Please read and acknowledge the SPARK Code of Conduct before
          completing your registration.
        </p>
      </div>

      {/* Acknowledgement checkbox */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4">
        <Checkbox
          id="coc-checkbox"
          checked={acknowledged}
          onCheckedChange={(v) => setAcknowledged(v === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="coc-checkbox"
          className="text-sm leading-relaxed cursor-pointer"
        >
          I have read and agree to the SPARK{" "}
          <Link
            href="/code-of-conduct"
            target="_blank"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Code of Conduct
          </Link>
          . I understand that violating these standards may result in the
          suspension or removal of my account.
        </Label>
      </div>

      {step < totalSteps && (
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!acknowledged || loading}
            loading={loading}
          >
            I Agree &amp; Continue
          </Button>
        </div>
      )}
    </div>
  )
}
