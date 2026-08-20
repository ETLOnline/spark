"use client"

import { TriangleAlert, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
}

export function RejectRequestDialog({
  open,
  onOpenChange,
  studentName
}: Props) {
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
              {studentName} will be notified that their advisor request was not
              accepted. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Reason (optional)</p>
          <Textarea
            placeholder="Let the student know why their request was rejected..."
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1.5" />
            Reject Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
