"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { EmailStep } from "./EmailStep"
import { OtpStep } from "./OtpStep"
import { SuccessStep } from "./SuccessStep"

type Screen = "email" | "otp" | "success"

const SCREEN_TITLES: Record<Screen, string> = {
  email: "Verify Your Identity",
  otp: "Enter Verification Code",
  success: "Identity Verified"
}

interface EmailVerificationDialogProps {
  open: boolean
  userId: string
  onOpenChange: (open: boolean) => void
  onVerified: (email: string) => void
}

export function EmailVerificationDialog({
  open,
  userId,
  onOpenChange,
  onVerified
}: EmailVerificationDialogProps) {
  const [screen, setScreen] = useState<Screen>("email")
  const [email, setEmail] = useState("")

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setScreen("email")
      setEmail("")
    }
    onOpenChange(nextOpen)
  }

  const handleDone = () => {
    onVerified(email)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-[420px] p-0 gap-0 flex flex-col max-h-[90dvh]"
      >
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {SCREEN_TITLES[screen]}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {screen === "email" && (
            <EmailStep
              userId={userId}
              onSubmitted={(submittedEmail) => {
                setEmail(submittedEmail)
                setScreen("otp")
              }}
            />
          )}
          {screen === "otp" && (
            <OtpStep
              email={email}
              userId={userId}
              onBack={() => setScreen("email")}
              onVerified={() => setScreen("success")}
            />
          )}
          {screen === "success" && (
            <SuccessStep email={email} onDone={handleDone} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
