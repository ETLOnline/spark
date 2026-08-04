"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"

interface CompletionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  topic: string
  isLoading?: boolean
}

export function CompletionDialog({
  open,
  onClose,
  onConfirm,
  topic,
  isLoading = false
}: CompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Confirm Completion
          </DialogTitle>
          <DialogDescription>
            Have you completed the session{" "}
            <span className="font-medium text-foreground">"{topic}"</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Not Yet
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Yes, Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
