import { Textarea } from "@/src/components/ui/textarea"
import { NewPost, PostType } from "./types/posts-types"
import TagsInput from "../../TagsInput/TagsInput"
import "./create-post-input.css"
import { FileUpload } from "../../ui/file-upload"

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

const CreatePostInput: React.FC<Props> = ({
  type,
  setNewPost,
  newPost,
  pollOptions,
  setPollOptions
}) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert file to Base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setNewPost({
          ...newPost,
          type: file.type.startsWith("image/") ? PostType.image : PostType.file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileBase64: base64String
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return type === "text" ? (
    <Textarea
      placeholder="What's on your mind?"
      value={newPost.content as string}
      onChange={(e) =>
        setNewPost({
          ...newPost,
          content: e.target.value,
          type: PostType.text
        })
      }
      required
      className="min-h-[100px]"
    />
  ) : type === "image" ? (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col justify-center items-center pt-4">
        <FileUpload
          onChange={(files: File[]) => {
            handleFileUpload({
              target: { files: [...files] }
            } as unknown as React.ChangeEvent<HTMLInputElement>)
          }}
          accept="image/*"
        />
      </div>
      <Textarea
        placeholder="Add a caption..."
        value={newPost.content as string}
        onChange={(e) =>
          setNewPost({
            ...newPost,
            content: e.target.value
          })
        }
        className="min-h-[60px]"
      />
    </div>
  ) : type === "poll" ? (
    <div className="flex flex-col space-y-2">
      <Textarea
        placeholder="Enter your poll question"
        value={newPost.content as string}
        onChange={(e) =>
          setNewPost({
            ...newPost,
            content: e.target.value,
            type: PostType.poll
          })
        }
        className="min-h-[100px]"
        required
      />
      <TagsInput
        tags={pollOptions as string[]}
        updateTags={setPollOptions as PollOptionsSetter}
        placeholder="Type to add poll options..."
      />
    </div>
  ) : (
    <div className="flex flex-col space-y-4">
      <FileUpload
        onChange={(files: File[]) => {
          handleFileUpload({
            target: { files: [...files] }
          } as unknown as React.ChangeEvent<HTMLInputElement>)
        }}
      />
      <Textarea
        placeholder="Add a description..."
        value={newPost.content as string}
        onChange={(e) =>
          setNewPost({
            ...newPost,
            content: e.target.value
          })
        }
        className="min-h-[60px]"
      />
    </div>
  )
}

export default CreatePostInput
