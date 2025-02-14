import { Textarea } from "@/src/components/ui/textarea"
import { Input } from "@/src/components/ui/input"
import { NewPost, PostType } from "./types/posts-types.d"
import TagsInput from "../../TagsInput/TagsInput"

type PollOptionsSetter = (
  tags: string[] | ((tags: string[]) => string[])
) => void

type Props = {
  type: PostType
  setNewPost: (newPost: NewPost) => void
  newPost: NewPost
  pollOptions?: string[]
  setPollOptions?: (tags: string[] | ((tags: string[]) => string[])) => void
}

const CreatePostInput: React.FC<Props> = (props) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      props.setNewPost({
        ...props.newPost,
        type: PostType.file,
        content: file.name,
        fileName: file.name,
        fileSize: file.size.toString()
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
          type: PostType.text
        })
      }
      className="min-h-[100px]"
    />
  ) : props.type === "image" ? (
    <Input
      type={PostType.file}
      accept="image/*"
      onChange={() =>
        props.setNewPost({ ...props.newPost, type: PostType.image })
      }
    />
  ) : props.type === "poll" ? (
    <div className="flex flex-col space-y-2">
      <Textarea
        placeholder="Enter your poll question"
        value={props.newPost.content as string}
        onChange={(e) =>
          props.setNewPost({
            ...props.newPost,
            content: e.target.value,
            type: PostType.poll
          })
        }
        className="min-h-[100px]"
      />
      <TagsInput
        tags={props.pollOptions as string[]}
        updateTags={props.setPollOptions as PollOptionsSetter}
        placeholder="Type to add poll options..."
      />
    </div>
  ) : (
    props.type === "file" && (
      <Input type={PostType.file} onChange={handleFileUpload} />
    )
  )
}

export default CreatePostInput
