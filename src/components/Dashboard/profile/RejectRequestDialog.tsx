"use client"

import { useState } from "react"
import { TriangleAlert, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { RejectAdvisorRequestAction } from "@/src/server-actions/AdvisorRequest/AdvisorRequest"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  studentName: string
  onRejected: () => void
}

export function RejectRequestDialog({
  open,
  onOpenChange,
  requestId,
  studentName,
  onRejected
}: Props) {
  const [reason, setReason] = useState("")
  const { toast } = useToast()
  const [rejecting, , , rejectRequest] = useServerAction(
    RejectAdvisorRequestAction
  )

  async function handleReject() {
    const result = await rejectRequest(requestId, reason.trim())
    if (result?.success) {
      setReason("")
      onOpenChange(false)
      onRejected()
    } else {
      toast({
        variant: "destructive",
        title: "Could not reject request",
        description:
          typeof result?.error === "string"
            ? result.error
            : "Something went wrong."
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Request</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-lg bg-red-500/10 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15">
            <TriangleAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Reject this request?</p>
            <p className="text-xs text-muted-foreground">
              {studentName} will not be notified which advisor rejected this
              request. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Reason (optional)</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Let the student know why their request was rejected..."
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={rejecting}
          >
            <X className="h-4 w-4 mr-1.5" />
            {rejecting ? "Rejecting..." : "Reject Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
