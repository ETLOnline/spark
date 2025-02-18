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
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert file to Base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        props.setNewPost({
          ...props.newPost,
          type: file.type.startsWith("image/") ? PostType.image : PostType.file,
          fileName: file.name,
          fileSize: file.size.toString(),
          fileType: file.type,
          fileBase64: base64String
        })
      }
      reader.readAsDataURL(file)
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
      required
      className="min-h-[100px]"
    />
  ) : props.type === "image" ? (
    <Input type="file" accept="image/*" onChange={handleFileUpload} required />
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
        required
      />
      <TagsInput
        tags={props.pollOptions as string[]}
        updateTags={props.setPollOptions as PollOptionsSetter}
        placeholder="Type to add poll options..."
      />
    </div>
  ) : (
    props.type === "file" && (
      <Input type="file" onChange={handleFileUpload} required />
    )
  )
}

export default CreatePostInput
