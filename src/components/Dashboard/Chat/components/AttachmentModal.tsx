"use client"

import React, { useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import Image from "next/image"
import { FileIcon } from "lucide-react"
import { formatFileSize } from "@/src/utils/helpers"

interface Props {
  open: boolean
  onClose: () => void
  onSend: () => Promise<void>
  sending?: boolean
  imageUrl: string
  file?: File | null
}

export default function AttachmentModal({
  open,
  onClose,
  onSend,
  sending,
  imageUrl,
  file
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Attachment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          {file ? (
            <div className="flex flex-col items-center w-full gap-3">
              {file.type.startsWith("image/") ? (
                <div className="w-full max-h-64 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={file.name}
                    className="w-full h-full object-contain max-w-sm max-h-64"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg w-fit">
                  <FileIcon className="h-8 w-8" />
                  <span className="font-medium">{file?.name}</span>
                  <span className="text-xs text-primary">
                    {formatFileSize(file?.size)}
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                {file.name}
              </p>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              No attachment selected
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={sending || !file}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
