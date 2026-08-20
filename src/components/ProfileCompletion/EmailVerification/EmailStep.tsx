"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { toast } from "@/src/hooks/use-toast"
import {
  GetVerifiedProfileByEmailAction,
  SendEmailOtpAction
} from "@/src/server-actions/Otp/Otp"
import {
  VerificationEmailFormValues,
  verificationEmailSchema
} from "./emailValidation"

type EmailFormValues = VerificationEmailFormValues

interface EmailStepProps {
  userId: string
  onSubmitted: (email: string) => void
}

export function EmailStep({ userId, onSubmitted }: EmailStepProps) {
  const [isSending, setIsSending] = useState(false)

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(verificationEmailSchema),
    defaultValues: { email: "" }
  })

  const handleSendCode = async (data: EmailFormValues) => {
    setIsSending(true)
    try {
      const verifiedCheck = await GetVerifiedProfileByEmailAction(data.email)
      if (verifiedCheck?.data) {
        form.setError("email", {
          type: "manual",
          message: "This email is already verified or taken."
        })
        return
      }

      const result = await SendEmailOtpAction(data.email, userId)
      if (!result?.success) {
        toast({
          title: "Couldn't send code",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
          duration: 2500
        })
        return
      }

      toast({
        title: "Verification code sent",
        description: `We've sent a 6-digit code to ${data.email}`,
        duration: 2500
      })
      onSubmitted(data.email)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSendCode)}
      className="space-y-4 py-2"
    >
      <p className="text-sm text-muted-foreground">
        Confirm you&apos;re an authentic student, faculty member, or mentor with
        your university (.edu), faculty, or company email.Personal providers
        like Gmail, Yahoo, or Outlook aren&apos;t accepted.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="verification-email" className="font-semibold">
          University / Company Email Address
        </Label>
        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <Input
              id="verification-email"
              type="email"
              placeholder="you@company.com"
              autoFocus
              {...field}
            />
          )}
        />
        {form.formState.errors.email && (
          <span className="text-red-500 text-sm">
            {form.formState.errors.email.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={isSending}
        disabled={isSending}
      >
        Send Verification Code
      </Button>
    </form>
  )
}
