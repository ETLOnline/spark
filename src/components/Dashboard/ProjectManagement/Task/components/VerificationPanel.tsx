"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateTrustVerificationAction } from "@/src/server-actions/Reward/Reward"
import { TrustVerificationStatus } from "@/src/types/Rewards/rewards"
import { toast } from "@/src/hooks/use-toast"
import { ShieldCheck, ShieldX } from "lucide-react"

interface Props {
  verificationStatus: {
    status: string
    verification_id: number
    feedback: string | null
  }
  onStatusChange?: (newStatus: string, newFeedback: string) => void
}

export default function VerificationPanel({
  verificationStatus,
  onStatusChange
}: Props) {
  const [feedback, setFeedback] = useState<string>(
    verificationStatus.feedback ?? ""
  )
  const [savedStatus, setSavedStatus] = useState<string>(
    verificationStatus.status
  )
  const [savedFeedback, setSavedFeedback] = useState<string>(
    verificationStatus.feedback ?? ""
  )

  const [loading, , , updateVerification] = useServerAction(
    UpdateTrustVerificationAction
  )

  // Once approved, lock permanently — points have been awarded and cannot be undone
  // Rejected can still be re-reviewed and approved
  const isLocked = savedStatus === TrustVerificationStatus.Approved

  const handleAction = async (newStatus: string) => {
    if (isLocked) return

    const res = await updateVerification(
      verificationStatus.verification_id,
      newStatus,
      feedback
    )

    if (res?.success) {
      setSavedStatus(newStatus)
      setSavedFeedback(feedback)
      onStatusChange?.(newStatus, feedback)
      toast({
        title: "Verification updated",
        description: `Status set to ${newStatus}`,
        duration: 3000
      })
    } else {
      toast({
        title: "Failed to update verification",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return (
    <div className="space-y-2 pl-2">
      <Label className="text-xl font-semibold flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Verification
      </Label>

      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,118,110,0.25) 0%, rgba(67,56,202,0.25) 100%)",
          border: "1px solid rgba(99,102,241,0.25)"
        }}
      >
        {/* Locked notice */}
        {isLocked && (
          <p className="text-xs text-muted-foreground">
            This verification has been{" "}
            <span className="text-green-400">approved</span>. Points have
            already been awarded and cannot be changed.
          </p>
        )}

        {/* Current status badge when locked */}
        {isLocked && (
          <div className="flex items-center gap-2 text-sm font-medium text-green-400">
            <ShieldCheck className="h-4 w-4" />
            Approved
          </div>
        )}

        {/* Feedback / Recommendation */}
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">
            Feedback / Recommendation
          </Label>
          {isLocked ? (
            <div className="bg-background/50 border border-white/10 rounded-md px-3 py-2 text-sm min-h-[90px] whitespace-pre-wrap">
              {savedFeedback || (
                <span className="text-muted-foreground italic">
                  No feedback provided
                </span>
              )}
            </div>
          ) : (
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add feedback or recommendation..."
              className="bg-background/50 border-white/10 resize-none min-h-[90px]"
            />
          )}
        </div>

        {/* Action buttons */}
        {!isLocked && (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
              onClick={() => handleAction(TrustVerificationStatus.Rejected)}
              loading={loading}
              disabled={loading}
            >
              <ShieldX className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              type="button"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAction(TrustVerificationStatus.Approved)}
              loading={loading}
              disabled={loading}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
