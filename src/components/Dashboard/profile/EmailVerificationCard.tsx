"use client"

import { useState } from "react"
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react"
import { EmailVerificationDialog } from "../../ProfileCompletion/EmailVerification/EmailVerificationDialog"

export default function EmailVerificationCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 flex items-center gap-4">
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
          <div className="flex-1">
            {isVerified ? (
              <>
                <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                  Identity Verified
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground">{verifiedEmail}</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-foreground">
                  Verify your identity
                </h3>
                <p className="text-sm text-muted-foreground">
                  Confirm you&apos;re an authentic student, faculty member, or
                  mentor using your university or company email.
                </p>
              </>
            )}
          </div>
          {!isVerified && (
            <Button
              className="shrink-0"
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
        onOpenChange={setIsDialogOpen}
        onVerified={(email) => {
          setIsVerified(true)
          setVerifiedEmail(email)
        }}
      />
    </>
  )
}
