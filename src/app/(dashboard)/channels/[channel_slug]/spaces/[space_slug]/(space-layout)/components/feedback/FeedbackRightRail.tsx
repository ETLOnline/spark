"use client"

import { Award, Info, Lock, LayoutGrid, Send, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"

const NEXT_STEPS = [
  {
    icon: Send,
    title: "Submit your feedback",
    body: "Help us improve the program and SPARK platform."
  },
  {
    icon: Award,
    title: "Reflections on profiles",
    body: "Your feedback helps other users make informed decisions and recognize great collaboration."
  },
  {
    icon: Star,
    title: "Stay connected",
    body: "You'll continue to have access to this space and project resources."
  }
]

export function FeedbackRightRail({
  totalMilestones,
  verifiedMilestones
}: {
  totalMilestones: number
  verifiedMilestones: number
}) {
  const router = useRouter()
  const progressPct = totalMilestones
    ? Math.round((verifiedMilestones / totalMilestones) * 100)
    : 0

  return (
    <div className="w-72 shrink-0 space-y-4">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-2.5">
        <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-primary">
            Feedback is now available!
          </p>
          <p className="text-xs text-primary/80">
            Once submitted, it will be reflected in the Recommendations
            section.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">Project Progress</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            All milestones completed
          </span>
          <span className="font-semibold text-primary">
            {verifiedMilestones}/{totalMilestones}
          </span>
        </div>
        <Progress value={progressPct} className="h-1.5" />
        <Button
          variant="outline"
          size="sm"
          className="w-full cursor-pointer"
          onClick={() => router.push("?page-type=fyp")}
        >
          <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
          View Milestones
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3.5">
        <p className="text-sm font-semibold">What happens next?</p>
        {NEXT_STEPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold">{title}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-4 flex items-start gap-2.5">
        <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold">Your Privacy</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Your feedback is only used for program improvement. Only the
            ratings noted above are shared in Recommendations.
          </p>
        </div>
      </div>
    </div>
  )
}
