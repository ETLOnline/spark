// server component
import PostCard from "./post-card"
import { Post, PostFile, PostPoll } from "./types/posts-types"

type Props = {
  posts: (Post | PostFile | PostPoll)[]
  setPosts: (posts: (Post | PostFile | PostPoll)[]) => void
}

const PostFeed: React.FC<Props> = (props) => {
  return (
    <div className="space-y-6">
      {props.posts.map((post: Post) => (
        <PostCard
          key={post.id}
          post={post}
          posts={props.posts}
          setPosts={props.setPosts}
        />
      ))}
    </div>
  )
}

export default PostFeed
