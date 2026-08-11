"use client"

import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react"
import { Button } from "@/src/components/ui/button"
import { toast } from "@/src/hooks/use-toast"
import {
  SendEmailOtpAction,
  VerifyEmailOtpAction
} from "@/src/server-actions/Otp/Otp"

const OTP_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30

interface OtpStepProps {
  email: string
  userId: string
  onBack: () => void
  onVerified: () => void
}

export function OtpStep({ email, userId, onBack, onVerified }: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const handleChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "")
    setError(null)

    if (!sanitized) {
      setDigits((prev) => {
        const next = [...prev]
        next[index] = ""
        return next
      })
      return
    }

    setDigits((prev) => {
      const next = [...prev]
      next[index] = sanitized.slice(-1)
      return next
    })

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
    if (!pasted) return

    e.preventDefault()
    const next = Array(OTP_LENGTH).fill("")
    pasted.split("").forEach((char, i) => (next[i] = char))
    setDigits(next)
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  const handleVerify = async () => {
    const code = digits.join("")
    if (code.length < OTP_LENGTH) {
      setError("Enter the complete 6-digit code")
      return
    }

    setIsVerifying(true)
    setError(null)
    try {
      const result = await VerifyEmailOtpAction(userId, email, code)
      if (result?.success) {
        onVerified()
      } else {
        setError("Invalid code. Please try again.")
        setDigits(Array(OTP_LENGTH).fill(""))
        focusInput(0)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const result = await SendEmailOtpAction(email, userId)
      if (!result?.success) {
        toast({
          title: "Couldn't resend code",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
          duration: 2500
        })
        return
      }

      toast({
        title: "Code resent",
        description: `A new code was sent to ${email}`,
        duration: 2500
      })
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setDigits(Array(OTP_LENGTH).fill(""))
      setError(null)
      focusInput(0)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code sent to{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <div className="flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="h-12 w-12 text-center text-lg font-semibold rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        className="w-full"
        onClick={handleVerify}
        loading={isVerifying}
        disabled={isVerifying}
      >
        Verify Code
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          Change email
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  )
}
