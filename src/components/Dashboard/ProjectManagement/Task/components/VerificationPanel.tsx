"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateTrustVerificationAction } from "@/src/server-actions/Reward/Reward"
import { TrustVerificationStatus } from "@/src/types/Rewards/rewards"
import { toast } from "@/src/hooks/use-toast"
import { ShieldCheck } from "lucide-react"

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
  const [status, setStatus] = useState<string>(verificationStatus.status)
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

  const handleSave = async () => {
    if (!status || isLocked) return

    const res = await updateVerification(
      verificationStatus.verification_id,
      status,
      feedback
    )

    if (res?.success) {
      setSavedStatus(status)
      setSavedFeedback(feedback)
      onStatusChange?.(status, feedback)
      toast({
        title: "Verification updated",
        description: `Status set to ${status}`,
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

  const statusConfig: Record<string, { label: string; className: string }> = {
    [TrustVerificationStatus.Pending]: {
      label: "Pending",
      className: "text-yellow-400"
    },
    [TrustVerificationStatus.Approved]: {
      label: "Approved",
      className: "text-green-400"
    },
    [TrustVerificationStatus.Rejected]: {
      label: "Rejected",
      className: "text-red-400"
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
            <span className={statusConfig[savedStatus]?.className}>
              approved
            </span>
            . Points have already been awarded and cannot be changed.
          </p>
        )}

        {/* Status dropdown */}
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={setStatus} disabled={isLocked}>
            <SelectTrigger className="bg-background/50 border-white/10 disabled:opacity-60">
              <SelectValue placeholder="Select status">
                {status && (
                  <span className={statusConfig[status]?.className}>
                    {statusConfig[status]?.label}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TrustVerificationStatus.Pending}>
                <span className="text-yellow-400">Pending</span>
              </SelectItem>
              <SelectItem value={TrustVerificationStatus.Approved}>
                <span className="text-green-400">Approved</span>
              </SelectItem>
              <SelectItem value={TrustVerificationStatus.Rejected}>
                <span className="text-red-400">Rejected</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        {/* Save button */}
        {!isLocked && (
          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground"
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          >
            Save Verification
          </Button>
        )}
      </div>
    </div>
  )
}
