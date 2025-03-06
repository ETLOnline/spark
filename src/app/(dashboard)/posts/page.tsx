import PostFeed from "@/src/components/Dashboard/post-feed"
import CreatePostForm from "@/src/components/Dashboard/create-post-form"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { GetPublicPostsAction } from "@/src/server-actions/Post/Post"

const Posts: React.FC = async () => {
  let posts: (SelectPost | SelectFilePost | SelectPollPost)[] = []

  try {
    const res = await GetPublicPostsAction()
    if (res?.data) {
      posts = res.data
    } else {
      throw new Error("Failed to fetch posts", res.error)
    }
  } catch (error) {
    console.error("Error fetching posts!", error)
  }

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-3xl">
      <CreatePostForm />
      <PostFeed fetchedPosts={posts} />
    </div>
  )
}

export default Posts
export const dynamic = "force-dynamic"
