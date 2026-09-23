"use client"

import { Dispatch, SetStateAction } from "react"
import { SelectUser } from "@/src/db/schema"
import { CocAcknowledgeForm } from "@/src/components/shared/CocAcknowledgeForm"

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
  const handlePrevious = () => {
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSuccess = () => {
    setStep((prev) => prev + 1)
    window.scrollTo(0, 0)
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

      {step < totalSteps && (
        <CocAcknowledgeForm
          userId={user.unique_id}
          submitLabel="I Agree & Continue"
          onSuccess={handleSuccess}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  )
}
