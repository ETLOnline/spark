import { GetPostByIdAction } from "@/src/server-actions/Post/Post"
import SharedPostView from "@/src/components/Dashboard/posts/SharedPostView"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"

interface PostDetailPageProps {
  params: Promise<{
    post_id: string
  }>
}

const PostDetailPage = async ({ params }: PostDetailPageProps) => {
  const { post_id } = await params
  const result = await GetPostByIdAction(post_id)

  if (!result?.success || !result?.data) {
    return <NotFound />
  }

  return (
    <div className="container mx-auto py-8">
      <SharedPostView post={result.data} />
    </div>
  )
}

export default PostDetailPage
