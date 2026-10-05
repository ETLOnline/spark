"use client"

import { Badge } from "@/src/components/ui/badge"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  [MilestoneStatus.VERIFIED]: {
    label: "Verified",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
  },
  [MilestoneStatus.COMPLETED_PENDING_VERIFICATION]: {
    label: "Completed (Pending Verification)",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  },
  [MilestoneStatus.IN_PROGRESS]: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  [MilestoneStatus.INCOMPLETE]: {
    label: "Incomplete",
    className: "bg-muted/60 text-muted-foreground border-muted-foreground/20"
  }
}

export function MilestoneStatusBadge({ status }: { status: string }) {
  const { label, className } =
    STATUS_MAP[status] ?? STATUS_MAP[MilestoneStatus.INCOMPLETE]
  return (
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {label}
    </Badge>
  )
}
