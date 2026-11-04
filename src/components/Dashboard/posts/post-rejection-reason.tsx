import { XCircle } from "lucide-react"
import { PostStatus } from "@/src/types/Post/PostStatus"
import { PostModerationResult } from "@/src/services/ai/schemas/postCheck.schema"

// Shown to the author when the check failed; the saved reason is meant for the admin
const DEFAULT_REJECTION_REASON =
  "This post doesn't follow our community guidelines."

type Props = {
  status?: string | null
  moderationResult?: PostModerationResult | null
}

// Why the author's post was rejected: the AI's reason the admin agreed with
const PostRejectionReason = ({ status, moderationResult }: Props) => {
  if (status !== PostStatus.REJECTED) return null

  const reason =
    moderationResult?.outcome === "error" || !moderationResult?.reason
      ? DEFAULT_REJECTION_REASON
      : moderationResult.reason

  return (
    <div className="mb-4 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">Rejection reason: </span>
        {reason}
      </p>
    </div>
  )
}

export default PostRejectionReason
