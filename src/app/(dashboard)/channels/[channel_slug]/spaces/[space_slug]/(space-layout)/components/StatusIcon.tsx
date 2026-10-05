import { CheckCircle2, CircleDashed, Clock } from "lucide-react"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"

export function StatusIcon({ status }: { status: string }) {
  if (status === MilestoneStatus.VERIFIED)
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION)
    return <Clock className="h-5 w-5 text-amber-600" />
  if (status === MilestoneStatus.IN_PROGRESS)
    return <Clock className="h-5 w-5 text-blue-500" />
  return <CircleDashed className="h-5 w-5 text-muted-foreground/50" />
}
