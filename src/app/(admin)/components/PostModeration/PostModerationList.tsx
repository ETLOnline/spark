import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import PaginationComponent from "@/src/components/common/Pagination"
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
import PostModerationDetailModal from "./PostModerationDetailModal"
import PostModerationOutcomeBadge from "./PostModerationOutcomeBadge"
import { ModerationPost } from "./types"

interface PostModerationListProps {
  status: PostStatus.PENDING_REVIEW | PostStatus.REJECTED
}

function PostModerationList({ status }: PostModerationListProps) {
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
    <div className="w-full overflow-x-auto">
      <div className="rounded-md border min-w-[860px]">
        <div className="grid grid-cols-12 gap-3 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
          <div className="col-span-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Author</span>
          </div>
          <div className="col-span-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Post</span>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>AI outcome</span>
          </div>
          <div className="col-span-2">Reason</div>
          <div className="col-span-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Held</span>
          </div>
          <div className="col-span-2 flex items-center justify-center gap-2">
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
                className="grid grid-cols-12 gap-3 p-4 border-t items-center hover:bg-muted/50 transition delay-150 duration-300 text-sm"
              >
                <div className="col-span-2 font-medium">
                  {post.author?.first_name} {post.author?.last_name}
                </div>
                <div className="col-span-3">
                  <p
                    className="line-clamp-2 break-words"
                    title={htmlToPlainText(post.content ?? "")}
                  >
                    {htmlToPlainText(post.content ?? "") || "No text"}
                  </p>
                  <span className="text-xs text-muted-foreground capitalize">
                    {post.type}
                    {post.files.length ? ` · ${post.files.length} file(s)` : ""}
                  </span>
                </div>
                <div className="col-span-2">
                  <PostModerationOutcomeBadge result={post.moderation_result} />
                </div>
                <div className="col-span-2 text-muted-foreground line-clamp-2">
                  {post.moderation_result?.reason}
                </div>
                <div className="col-span-1 text-muted-foreground">
                  {formatRelativeTime(post.created_at)}
                </div>
                <div className="col-span-2 text-center">
                  <Button onClick={() => handleClick(post)}>
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
