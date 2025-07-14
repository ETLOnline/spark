import { GetPostByIdAction } from "@/src/server-actions/Post/Post"
import { notFound } from "next/navigation"
import SharedPostView from "@/src/components/Dashboard/posts/SharedPostView"

interface PostDetailPageProps {
  params: Promise<{
    post_id: string
  }>
}

const PostDetailPage = async ({ params }: PostDetailPageProps) => {
  const { post_id } = await params
  const result = await GetPostByIdAction(post_id)

  if (!result?.success || !result?.data) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <SharedPostView post={result.data} />
    </div>
  )
}

export default PostDetailPage
