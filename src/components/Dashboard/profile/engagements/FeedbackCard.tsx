import { Globe, Lock, Star } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { FeedbackItem } from "./types"

interface FeedbackCardProps {
  item: FeedbackItem
  isMentor: boolean
}

export function FeedbackCard({ item, isMentor }: FeedbackCardProps) {
  // We only ever display received feedback, so the label is always the sender's role
  const label = isMentor ? "Mentee's feedback" : "Mentor's feedback"

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-foreground/8 bg-foreground/[0.02] p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-semibold shrink-0">
            {item.submittedBy.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">
              {item.submittedBy.name}
            </p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.visibility === "private" ? (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground border border-foreground/10 rounded-full px-2 py-0.5">
              <Lock className="h-2.5 w-2.5" />
              Private
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground border border-foreground/10 rounded-full px-2 py-0.5">
              <Globe className="h-2.5 w-2.5" />
              Public
            </span>
          )}
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i <= item.rating
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-muted-foreground/20"
            )}
            strokeWidth={1.5}
          />
        ))}
        <span className="ml-1.5 text-xs text-muted-foreground">
          {item.rating}/5
        </span>
      </div>

      {/* Comment */}
      {item.comment && (
        <p className="text-xs text-foreground/75 leading-relaxed">
          {item.comment}
        </p>
      )}
    </div>
  )
}
