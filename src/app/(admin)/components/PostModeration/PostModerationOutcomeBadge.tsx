import { Badge } from "@/src/components/ui/badge"
import {
  getModerationSummary,
  PostModerationResult
} from "@/src/services/ai/schemas/postCheck.schema"
import { AlertTriangle, Ban, CircleHelp, UserCheck } from "lucide-react"
import React from "react"

const OUTCOMES = {
  blocked: { label: "Blocked", icon: Ban, className: "text-red-600" },
  needs_review: {
    label: "Needs review",
    icon: AlertTriangle,
    className: "text-amber-600"
  },
  error: { label: "AI failed", icon: CircleHelp, className: "text-blue-600" },
  manual_review: {
    label: "Manual review",
    icon: UserCheck,
    className: "text-slate-600"
  }
} as const

// The AI's outcome for a held post
function PostModerationOutcomeBadge({
  result
}: {
  result: PostModerationResult | null
}) {
  const outcome = OUTCOMES[result?.outcome ?? "error"]
  const Icon = outcome.icon
  const { verdict } = getModerationSummary(result)
  const confidence =
    verdict && result?.outcome !== "error"
      ? ` · ${Math.round(verdict.confidence * 100)}%`
      : ""

  return (
    <Badge
      variant="outline"
      className={`text-sm font-medium flex w-fit items-center gap-2 ${outcome.className}`}
    >
      <Icon className="w-4 h-4" />
      {outcome.label}
      {confidence}
    </Badge>
  )
}

export default PostModerationOutcomeBadge
