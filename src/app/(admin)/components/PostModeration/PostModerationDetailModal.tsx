import ExpandableText from "@/src/components/Dashboard/posts/ExpandableText"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { ReviewPostAction } from "@/src/server-actions/Post/PostModeration"
import {
  CheckStatus,
  getModerationSummary
} from "@/src/services/ai/schemas/postCheck.schema"
import { PostStatus } from "@/src/types/Post/PostStatus"
import { TOP_CHECKS_COUNT } from "@/src/services/ai/constants"
import { formatRelativeTime } from "@/src/utils/helpers"
import { Check, Info, X } from "lucide-react"
import React from "react"
import PostModerationOutcomeBadge from "./PostModerationOutcomeBadge"
import { ModerationPost } from "./types"

const BAR_COLORS: Record<CheckStatus, string> = {
  flagged: "bg-red-600",
  uncertain: "bg-amber-500",
  clear: "bg-slate-400"
}

interface PostModerationDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: ModerationPost | null
  onReviewed: () => void
}

// Post content and images, why the AI held it, and its overall verdict with the top reasons
function PostModerationDetailModal({
  open,
  onOpenChange,
  post,
  onReviewed
}: PostModerationDetailModalProps) {
  const { toast } = useToast()
  const [reviewLoading, , , reviewPost] = useServerAction(ReviewPostAction)
  const result = post?.moderation_result
  const topChecks = getModerationSummary(result).checks.slice(
    0,
    TOP_CHECKS_COUNT
  )
  const images = post?.files.filter((f) => f.file_type.startsWith("image/"))
  const otherFiles = post?.files.filter(
    (f) => !f.file_type.startsWith("image/")
  )

  const handleReview = async (action: "approve" | "reject") => {
    if (!post) return
    const res = await reviewPost(post.id, action)
    if (res?.success) {
      toast({
        title: action === "approve" ? "Post approved" : "Post rejected",
        description:
          action === "approve"
            ? "The post is now visible to everyone."
            : "The post is hidden from everyone."
      })
      onOpenChange(false)
      onReviewed()
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: res?.error || "Failed to review post"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <Avatar>
            <AvatarImage
              src={post?.author?.profile_url || undefined}
              alt={post?.author?.first_name}
            />
            <AvatarFallback>
              {post?.author?.first_name?.[0]}
              {post?.author?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <DialogTitle className="text-xl truncate">
              {post?.author?.first_name} {post?.author?.last_name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {formatRelativeTime(post?.created_at)}
            </p>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(100vh-12rem)] w-full overflow-y-auto pr-3">
          <div className="space-y-6">
            {/* What readers would see */}
            <section className="space-y-3 rounded-md border p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Post content
              </h3>
              {post?.content && (
                <ExpandableText content={post.content} lines={8} isHtml />
              )}
              {!!post?.options?.length && (
                <ul className="space-y-2">
                  {post.options.map((option) => (
                    <li
                      key={option.id}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      {option.option_text}
                    </li>
                  ))}
                </ul>
              )}
              {!!images?.length && (
                <div className="grid grid-cols-2 gap-3">
                  {images.map((image) => (
                    <img
                      key={image.id}
                      src={image.file_path}
                      alt={image.file_name}
                      className="h-48 w-full rounded-md object-cover"
                    />
                  ))}
                </div>
              )}
              {otherFiles?.map((file) => (
                <a
                  key={file.id}
                  href={file.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm underline"
                >
                  {file.file_name}
                </a>
              ))}
            </section>

            {result?.outcome === "error" ? (
              <section className="flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <Info className="h-5 w-5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold">{result.reason}</p>
                  {result.error && (
                    <p className="font-mono text-xs">{result.error}</p>
                  )}
                </div>
              </section>
            ) : (
              <>
                <section className="rounded-md border bg-card p-4 text-sm text-red-600">
                  <h3 className="mb-1 font-semibold">Why it was held</h3>
                  <p>{result?.reason}</p>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">AI verdict</h3>
                    <PostModerationOutcomeBadge result={result ?? null} />
                  </div>
                  {topChecks.map((check) => {
                    const percent = Math.round(check.probability * 100)
                    return (
                      <div key={check.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{check.label}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {percent}%
                          </span>
                        </div>
                        <div
                          role="img"
                          aria-label={`${check.label} ${percent} percent`}
                          className="h-2.5 overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className={`h-full rounded-full ${BAR_COLORS[check.status]}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </section>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          {post?.status === PostStatus.PENDING_REVIEW ? (
            <>
              <Button
                variant="outline"
                className="text-red-600"
                disabled={reviewLoading}
                onClick={() => handleReview("reject")}
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
              <Button
                disabled={reviewLoading}
                onClick={() => handleReview("approve")}
              >
                <Check className="w-4 h-4" />
                Approve
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Rejected
              {result?.review
                ? ` ${formatRelativeTime(result.review.reviewed_at)}`
                : ""}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PostModerationDetailModal
