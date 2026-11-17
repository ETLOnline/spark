import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import PaginationComponent from "@/src/components/common/Pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetModerationPostsAction } from "@/src/server-actions/Post/PostModeration"
import { htmlToPlainText } from "@/src/services/ai/utils/text"
import { PostStatus } from "@/src/types/Post/PostStatus"
import { MODERATION_PAGE_SIZE } from "@/src/services/ai/constants"
import { formatRelativeTime } from "@/src/utils/helpers"
import {
  ArrowRight,
  Clock,
  FileText,
  Gavel,
  ShieldAlert,
  User
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import PostLocation from "./PostLocation"
import PostModerationDetailModal from "./PostModerationDetailModal"
import PostModerationOutcomeBadge from "./PostModerationOutcomeBadge"
import { ModerationPost } from "./types"

// Author | Post (with where it was posted) | AI outcome | Reason | Held | Action
// Text columns shrink to fit (and truncate); badge, time and button columns are fixed so the
// header lines up with every row. No min width, so the table never scrolls sideways.
const GRID_COLS =
  "grid-cols-[minmax(0,1fr)_minmax(0,2fr)_200px_minmax(0,1.6fr)_110px_130px]"

function PostAuthor({ post }: { post: ModerationPost }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage
          src={post.author?.profile_url || undefined}
          alt={post.author?.first_name}
        />
        <AvatarFallback className="text-xs">
          {post.author?.first_name?.[0]}
          {post.author?.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium truncate">
        {post.author?.first_name} {post.author?.last_name}
      </span>
    </div>
  )
}

function PostPreview({ post }: { post: ModerationPost }) {
  const text = htmlToPlainText(post.content ?? "")
  return (
    <div className="min-w-0">
      <p className="line-clamp-2 break-words" title={text}>
        {text || "No text"}
      </p>
      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="shrink-0 text-xs text-muted-foreground capitalize">
          {post.type}
          {post.files.length ? ` · ${post.files.length} file(s)` : ""}
        </span>
        <PostLocation post={post} />
      </div>
    </div>
  )
}

interface PostModerationListProps {
  status: PostStatus.PENDING_REVIEW | PostStatus.REJECTED
  // called with the total number of posts in this status after every fetch
  onTotalChange?: (total: number) => void
}

function PostModerationList({
  status,
  onTotalChange
}: PostModerationListProps) {
  const [posts, setPosts] = useState<ModerationPost[]>([])
  const [pagination, setPagination] = useState<PaginationType>()
  const [selectedPost, setSelectedPost] = useState<ModerationPost | null>(null)
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const [getPostsLoading, , , getPosts] = useServerAction(
    GetModerationPostsAction
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const page = parseInt(searchParams.get("page") || "1", 10)

  const fetchData = async () => {
    const res = await getPosts({ page, limit: MODERATION_PAGE_SIZE, status })
    if (res?.success && res?.data) {
      setPosts(res.data.posts)
      setPagination(res.data.pagination)
      onTotalChange?.(res.data.pagination.total)
    }
  }

  useEffect(() => {
    fetchData()
  }, [searchParams.get("page"), status])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [status])

  const handleClick = (post: ModerationPost) => {
    setSelectedPost(post)
    setOpenDetailModal(true)
  }

  return (
    <div className="w-full">
      <div className="rounded-md border overflow-hidden">
        {/* column headings only make sense for the table layout (xl and up) */}
        <div
          className={`${GRID_COLS} hidden xl:grid gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Author</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Post</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>AI outcome</span>
          </div>
          <div>Reason</div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Held</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Gavel className="w-4 h-4" />
            Action
          </div>
        </div>

        {getPostsLoading ? (
          <div className="flex justify-center h-full w-full my-4">
            <Loader size={LoaderSizes.lg} />
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <div
                key={post.id}
                className="border-t first:border-t-0 xl:first:border-t text-sm hover:bg-muted/50 transition delay-150 duration-300"
              >
                {/* Table row: xl and up */}
                <div
                  className={`${GRID_COLS} hidden xl:grid gap-4 p-4 items-center`}
                >
                  <PostAuthor post={post} />
                  <PostPreview post={post} />
                  <div className="min-w-0">
                    <PostModerationOutcomeBadge
                      result={post.moderation_result}
                    />
                  </div>
                  <div className="min-w-0 text-muted-foreground line-clamp-2">
                    {post.moderation_result?.reason}
                  </div>
                  <div className="whitespace-nowrap text-muted-foreground">
                    {formatRelativeTime(post.created_at)}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleClick(post)}>
                      Review
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Card: below xl */}
                <div className="xl:hidden space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <PostAuthor post={post} />
                    <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(post.created_at)}
                    </span>
                  </div>
                  <PostPreview post={post} />
                  <PostModerationOutcomeBadge result={post.moderation_result} />
                  {post.moderation_result?.reason && (
                    <p className="text-muted-foreground line-clamp-2">
                      {post.moderation_result.reason}
                    </p>
                  )}
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => handleClick(post)}
                  >
                    Review
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {pagination && (
              <div className="flex justify-center my-4">
                <PaginationComponent pagination={pagination} />
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center h-full w-full my-4">
            <span className="text-muted-foreground">No posts found.</span>
          </div>
        )}

        <PostModerationDetailModal
          open={openDetailModal}
          onOpenChange={setOpenDetailModal}
          post={selectedPost}
          onReviewed={fetchData}
        />
      </div>
    </div>
  )
}

export default PostModerationList
