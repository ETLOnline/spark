"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react"
import { EmailVerificationDialog } from "../../ProfileCompletion/EmailVerification/EmailVerificationDialog"
import { GetProfileVerificationStatusAction } from "@/src/server-actions/profile/profile"

interface EmailVerificationCardProps {
  userId: string
}

export default function EmailVerificationCard({
  userId
}: EmailVerificationCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)

  useEffect(() => {
    const loadStatus = async () => {
      const result = await GetProfileVerificationStatusAction(userId)
      if (result?.success && result.data?.verified) {
        setIsVerified(true)
        setVerifiedEmail(result.data.email)
      }
    }
    loadStatus()
  }, [userId])

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-full shrink-0 ${
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
            <div className="min-w-0">
              {isVerified ? (
                <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                  Identity Verified
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                </h3>
              ) : (
                <h3 className="font-semibold text-foreground">
                  Verify your identity
                </h3>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {isVerified
              ? verifiedEmail
              : "Confirm you're an authentic student, faculty member, or mentor using your university or company email."}
          </p>

          {!isVerified && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
            >
              Verify Identity
            </Button>
          )}
        </CardContent>
      </Card>

      <EmailVerificationDialog
        open={isDialogOpen}
        userId={userId}
        onOpenChange={setIsDialogOpen}
        onVerified={(email) => {
          setIsVerified(true)
          setVerifiedEmail(email)
        }}
      />
    </>
  )
}
