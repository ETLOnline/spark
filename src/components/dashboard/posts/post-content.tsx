import Image from "next/image"
import { PostType } from "./types/posts-types"
import PostPoll from "./post-poll"
import PostFile from "./post-file"

type Props = {
  type: PostType
  content: string | File
  options?: string[]
  fileName?: string
}

const PostContent: React.FC<Props> = (props) => {
  return (
    <>
      {props.type === "text" && <p className="text-lg">{props.content as string}</p>}
      {props.type === "image" && (
        <Image
          src={props.content as string}
          alt="Post image"
          className="rounded-lg max-h-96 w-full object-cover"
          width={1000}
          height={1000}
        />
      )}
      {props.type === "poll" && (
        <PostPoll content={props.content as string} options={props.options as string[]} />
      )}
      {props.type === "file" && (
        <PostFile fileName={props.fileName as string} />
      )}
    </>
  )
}

export default PostContent
