import PostFeed from "@/src/components/Dashboard/post-feed"
import CreatePostForm from "@/src/components/Dashboard/create-post-form"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { GetUserPostsAction } from "@/src/server-actions/Post/Post"

const Posts: React.FC = async () => {
  const userId = (await AuthUserAction())?.unique_id
  let posts: (SelectPost | SelectFilePost | SelectPollPost)[] = []

  try {
    if (userId) {
      const res = await GetUserPostsAction(userId)
      if (res?.data) {
        posts = res.data
      } else {
        throw new Error("Failed to fetch posts", res.error)
      }
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
