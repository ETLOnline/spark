import { cn } from "@/src/lib/utils"
import { EngagementStatus } from "./types"

interface StatusPillProps {
  status: EngagementStatus
  size?: "sm" | "md"
}

export function StatusPill({ status, size = "sm" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full shrink-0",
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        status === "overdue" && "bg-red-500/10 text-red-500",
        status === "upcoming" && "bg-blue-500/10 text-blue-600",
        status === "open" && "bg-amber-500/10 text-amber-600",
        status === "completed" && "bg-emerald-500/10 text-emerald-600"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "overdue" && "bg-red-500",
          status === "upcoming" && "bg-blue-500",
          status === "open" && "bg-amber-500",
          status === "completed" && "bg-emerald-500"
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
