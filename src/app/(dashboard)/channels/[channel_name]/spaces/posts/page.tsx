import CreatePostForm from "@/src/components/Dashboard/create-post-form"
import PostFeed from "@/src/components/Dashboard/post-feed"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import {
  GetPublicPostsAction,
  GetSpacePostsAction
} from "@/src/server-actions/Post/Post"

type SpacePostsProps = {
  searchParams: { space_id: string; active_category: string }
}

const SpaceChatPage: React.FC<SpacePostsProps> = async ({ searchParams }) => {
  let posts: (SelectPost | SelectFilePost | SelectPollPost)[] = []

  try {
    const res = await GetSpacePostsAction(searchParams.space_id)
    if (res?.data) {
      posts = res.data
    } else {
      throw new Error("Failed to fetch posts", res.error)
    }
  } catch (error) {
    console.error("Error fetching posts!", error)
  }

  return (
    <>
      <CreatePostForm variant="spaces" />
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>
            Latest posts from {searchParams.active_category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostFeed ssrPosts={posts} />
        </CardContent>
      </Card>
    </>
  )
}

export default SpaceChatPage
