import { Textarea } from "@/src/components/ui/textarea"
import { Input } from "@/src/components/ui/input"
import { NewPost, PostType } from "./types/posts-types.d"

type Props = {
  type: PostType
  setNewPost: (newPost: NewPost) => void
  newPost: NewPost
}

const CreatePostInput: React.FC<Props> = (props) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      props.setNewPost({
        ...props.newPost,
        type: "file",
        content: file,
        fileName: file.name,
        fileSize: file.size
      })
    }
  }

  return props.type === "text" ? (
    <Textarea
      placeholder="What's on your mind?"
      value={props.newPost.content as string}
      onChange={(e) =>
        props.setNewPost({
          ...props.newPost,
          content: e.target.value,
          type: "text"
        })
      }
      className="min-h-[100px]"
    />
  ) : props.type === "image" ? (
    <Input
      type="file"
      accept="image/*"
      onChange={() => props.setNewPost({ ...props.newPost, type: "image" })}
    />
  ) : props.type === "poll" ? (
    <Textarea
      placeholder="Enter your poll question"
      value={props.newPost.content as string}
      onChange={(e) =>
        props.setNewPost({
          ...props.newPost,
          content: e.target.value,
          type: "poll"
        })
      }
      className="min-h-[100px]"
    />
  ) : (
    props.type === "file" && <Input type="file" onChange={handleFileUpload} />
  )
}

export default CreatePostInput
