"use client"

import { useState } from "react"
import { X, Mail, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Input } from "./input"
import { Button } from "./button"
import { cn } from "@/src/lib/utils"

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
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-semibold text-white">
            Invite Users to event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <p className="text-slate-300 text-sm">
            Invite users to join your event via link.
          </p>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-white">
                Share Invite Link
              </h3>
              <p className="text-slate-300 text-sm">
                Anyone with this link can join your event.
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Input
              value={inviteLink}
              readOnly
              className="flex-1 bg-slate-800 border-slate-600 text-slate-200 focus:border-slate-500"
            />
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
