"use client"

import { useState } from "react"
import { Mail, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Input } from "./input"
import { Button } from "./button"

interface InviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inviteLink?: string
}

export function InviteEventModal({
  open,
  onOpenChange,
  inviteLink = "http://localhost:3000/invite/6?type=event"
}: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Invite Users to event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <p className="text-muted-foreground text-sm">
            Invite users to join your event via link.
          </p>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-cyan-500" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Share Invite Link</h3>
              <p className="text-muted-foreground text-sm">
                Anyone with this link can join your event.
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Input value={inviteLink} readOnly className="flex-1" />
            <Button onClick={handleCopy} variant="outline">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
