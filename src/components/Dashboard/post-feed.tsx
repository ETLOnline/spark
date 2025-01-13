// server component

import FilePost from "./posts/post-file"
import ImagePost from "./posts/post-image"
import PollPost from "./posts/post-poll"
import TextPost from "./posts/post-text"
import { Post, PostFile, PostPoll } from "./posts/types/posts-types.d"

type Props = {
  posts: (Post | PostFile | PostPoll)[]
  setPosts: (posts: (Post | PostFile | PostPoll)[]) => void
}

const PostFeed: React.FC<Props> = (props) => {
  return (
    <div className="space-y-6">
      {props.posts.map((post: Post | PostFile | PostPoll) =>
        post.type === "text" ? (
          <TextPost
            key={post.id}
            post={post as Post}
            posts={props.posts}
            setPosts={props.setPosts}
          />
        ) : post.type === "image" ? (
          <ImagePost
            key={post.id}
            post={post as Post}
            posts={props.posts}
            setPosts={props.setPosts}
          />
        ) : post.type === "poll" ? (
          <PollPost
            key={post.id}
            post={post as PostPoll}
            posts={props.posts}
            setPosts={props.setPosts}
          />
        ) : (
          post.type === "file" && (
            <FilePost
              key={post.id}
              post={post as PostFile}
              posts={props.posts}
              setPosts={props.setPosts}
            />
          )
        )
      )}
    </div>
  )
}

export default PostFeed
