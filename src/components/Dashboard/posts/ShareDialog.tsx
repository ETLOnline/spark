"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"

interface ShareDialogProps {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  spaceId?: string
  channelSlug?: string
  spaceSlug?: string
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  postId,
  open,
  onOpenChange,
  spaceId,
  channelSlug,
  spaceSlug
}) => {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareUrl =
    spaceId && spaceId !== "shared" && channelSlug && spaceSlug
      ? `${window.location.origin}/channels/${channelSlug}/spaces/${spaceSlug}?page-type=posts&post-id=${postId}`
      : `${window.location.origin}/posts/${postId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Post link copied to clipboard"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input value={shareUrl} readOnly className="flex-1" />
          <Button size="sm" onClick={handleCopy} disabled={copied}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareDialog
