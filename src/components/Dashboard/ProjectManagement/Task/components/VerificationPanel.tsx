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
  isAssignee?: boolean
  onStatusChange?: (newStatus: string, newFeedback: string) => void
}

export default function VerificationPanel({
  verificationStatus,
  isAssignee = false,
  onStatusChange
}: Props) {
  const [feedback, setFeedback] = useState<string>("")
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
  const isRejected = savedStatus === TrustVerificationStatus.Rejected
  const isReadOnly = isLocked || isAssignee

  const handleAction = async (newStatus: string) => {
    if (isLocked || isAssignee) return

    const res = await updateVerification(
      verificationStatus.verification_id,
      newStatus,
      feedback
    )

    if (res?.success) {
      setSavedStatus(newStatus)
      setSavedFeedback(feedback)
      onStatusChange?.(newStatus, feedback)
      setFeedback("")

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
        {isLocked && (
          <>
            <p className="text-xs text-muted-foreground">
              This verification has been{" "}
              <span className="text-green-400">approved</span>. Points have
              already been awarded and cannot be changed.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-400">
                <ShieldCheck className="h-4 w-4" />
                Approved
              </div>
              <div className="pl-6 border-l-2 border-green-400/50 ml-1.5 py-1 space-y-1">
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                  Feedback
                </p>
                {savedFeedback ? (
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {savedFeedback}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    No approval feedback was provided.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Rejected notice */}
        {isRejected && (
          <>
            <p className="text-xs text-muted-foreground">
              This verification has been{" "}
              <span className="text-red-400">rejected</span>. Review the
              feedback below — the reviewer can re-verify once changes are made.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-red-400">
                <ShieldX className="h-4 w-4" />
                Rejected
              </div>
              <div className="pl-6 border-l-2 border-red-400/50 ml-1.5 py-1 space-y-1">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                  Reason
                </p>
                {savedFeedback ? (
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {savedFeedback}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    No rejection feedback was provided.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {isAssignee && !isLocked && (
          <p className="text-xs text-muted-foreground">
            You are the assignee of this task and cannot verify or reject it.
            Only the reviewer can take action here.
          </p>
        )}

        {/* Feedback / Recommendation — hidden when approved (shown above under status) */}
        {!isLocked && (
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">
              Feedback / Recommendation
            </Label>
            {isReadOnly ? (
              <div className="bg-background/50 border border-white/10 rounded-md px-3 py-2 text-sm min-h-[90px] whitespace-pre-wrap">
                <span className="text-muted-foreground italic">
                  No feedback provided
                </span>
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
        )}

        {!isLocked && !isAssignee && (
          <div className="flex gap-3">
            {!isRejected && (
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
            )}
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
