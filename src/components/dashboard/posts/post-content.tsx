import Image from "next/image"
import { PostType } from "./types/posts-types"
import PostPoll from "./post-poll"
import PostFile from "./post-file"
import PostText from "./post-text"
import PostImage from "./post-image"

type Props = {
  type: PostType
  content: string | File
  options?: string[]
  fileName?: string
}

const PostContent: React.FC<Props> = (props) => {
  return (
    <>
      {props.type === "text" && <PostText content={props.content as string} />}
      {props.type === "image" && (
        <PostImage content={props.content as string} />
      )}
      {props.type === "poll" && (
        <PostPoll
          content={props.content as string}
          options={props.options as string[]}
        />
      )}
      {props.type === "file" && (
        <PostFile fileName={props.fileName as string} />
      )}
    </>
  )
}

export default PostContent
