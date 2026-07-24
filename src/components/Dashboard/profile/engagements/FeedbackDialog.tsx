"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { Globe, Loader2, Lock, Star } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface FeedbackDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (
    rating: number,
    comment: string,
    visibility: "public" | "private"
  ) => void
  counterpartName: string
  isLoading?: boolean
}

export function FeedbackDialog({
  open,
  onClose,
  onSubmit,
  counterpartName,
  isLoading = false
}: FeedbackDialogProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [visibility, setVisibility] = useState<"public" | "private">("public")

  const handleClose = () => {
    setRating(0)
    setHovered(0)
    setComment("")
    setVisibility("public")
    onClose()
  }

  const handleSubmit = () => {
    if (rating === 0) return
    onSubmit(rating, comment, visibility)
  }

  const labels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Give Feedback</DialogTitle>
          <DialogDescription>
            Share your experience with{" "}
            <span className="font-medium text-foreground">
              {counterpartName}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Star rating */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Rating</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Button
                key={i}
                variant="ghost"
                size="icon"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
                className="p-0.5 transition-transform hover:scale-110 h-auto w-auto"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    (hovered || rating) >= i
                      ? "fill-amber-400 text-amber-400"
                      : "fill-none text-muted-foreground/30"
                  )}
                  strokeWidth={1.5}
                />
              </Button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {labels[hovered || rating]}
              </span>
            )}
          </div>
          {rating === 0 && (
            <p className="text-xs text-muted-foreground">
              Select a rating to continue
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Comment{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </span>
          <Textarea
            rows={4}
            placeholder="Share what went well or what could be improved..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Visibility */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Visibility</span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisibility("public")}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors h-auto justify-start",
                visibility === "public"
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-foreground/10 text-muted-foreground hover:border-foreground/20"
              )}
            >
              <Globe className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Public</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Visible to all participants
                </p>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisibility("private")}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors h-auto justify-start",
                visibility === "private"
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-foreground/10 text-muted-foreground hover:border-foreground/20"
              )}
            >
              <Lock className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Private</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Only you and recipient
                </p>
              </div>
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
