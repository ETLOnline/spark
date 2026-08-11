"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react"
import { SelectUser } from "@/src/db/schema"
import { EmailVerificationDialog } from "./EmailVerification/EmailVerificationDialog"

interface StepFourProps {
  step: number
  setStep: Dispatch<SetStateAction<number>>
  user: SelectUser
  setUser: Dispatch<SetStateAction<SelectUser | undefined>>
  totalSteps?: number
}

export function StepFour({
  step,
  setStep,
  user,
  totalSteps = 5
}: StepFourProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleContinue = () => {
    setStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const handleVerified = (email: string) => {
    setIsVerified(true)
    setVerifiedEmail(email)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Verify Your Identity</h3>
        <p className="text-sm text-muted-foreground">
          Confirm you&apos;re an authentic student, faculty member, or mentor
          using your university or company email (optional)
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div
            className={`p-3 rounded-full ${
              isVerified
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            {isVerified ? (
              <>
                <p className="font-semibold flex items-center gap-1.5">
                  Identity Verified
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </p>
                <p className="text-sm text-muted-foreground">{verifiedEmail}</p>
              </>
            ) : (
              <>
                <p className="font-semibold">Identity not verified yet</p>
                <p className="text-sm text-muted-foreground">
                  Confirm your status with a university or company email address
                </p>
              </>
            )}
          </div>
          {!isVerified && (
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Verify Identity
            </Button>
          )}
        </CardContent>
      </Card>

      {step < totalSteps && (
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
          <div className="flex items-center gap-3">
            {!isVerified && (
              <Button variant="ghost" onClick={handleContinue}>
                Skip for now
              </Button>
            )}
            <Button onClick={handleContinue} disabled={!isVerified}>
              Continue
            </Button>
          </div>
        </div>
      )}

      <EmailVerificationDialog
        open={isDialogOpen}
        userId={user.unique_id}
        onOpenChange={setIsDialogOpen}
        onVerified={handleVerified}
      />
    </div>
  )
}
