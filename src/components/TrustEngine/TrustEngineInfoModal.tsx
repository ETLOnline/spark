"use client"

import { Zap } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { TrustEngineDetails } from "./TrustEngineDetails"

interface TrustEngineInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrustEngineInfoModal({
  open,
  onOpenChange
}: TrustEngineInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Trust Engine
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[85vh] overflow-y-auto pr-2">
          <TrustEngineDetails />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
