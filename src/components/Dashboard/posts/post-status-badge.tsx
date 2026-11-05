import { Clock, XCircle } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { PostStatus } from "@/src/types/Post/PostStatus"

const STATUS_BADGES: Partial<
  Record<string, { label: string; icon: typeof Clock; className: string }>
> = {
  [PostStatus.PENDING_REVIEW]: {
    label: "Under Review",
    icon: Clock,
    className:
      "border-amber-500/40 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  },
  [PostStatus.REJECTED]: {
    label: "Rejected",
    icon: XCircle,
    className:
      "border-red-500/40 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  }
}

// Review status of the author's own post; nothing for published posts
const PostStatusBadge = ({ status }: { status?: string | null }) => {
  const badge = status ? STATUS_BADGES[status] : undefined
  if (!badge) return null
  const Icon = badge.icon

  return (
    <Badge variant="outline" className={`gap-1 ${badge.className}`}>
      <Icon className="h-3 w-3" />
      {badge.label}
    </Badge>
  )
}

export default PostStatusBadge
