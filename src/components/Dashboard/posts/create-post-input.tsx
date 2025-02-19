import { Textarea } from "@/src/components/ui/textarea"
import { NewPost, PostType } from "./types/posts-types.d"
import TagsInput from "../../TagsInput/TagsInput"
import { Upload } from "antd"
import { Button } from "../../ui/button"
import { UploadIcon } from "lucide-react"
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
    <div className="flex flex-col justify-center items-center pt-4">
      <Upload
        customRequest={({ file, onSuccess }) => {
          handleFileUpload({
            target: { files: [file] }
          } as unknown as React.ChangeEvent<HTMLInputElement>)
          onSuccess?.("ok")
        }}
        listType="picture"
        maxCount={1}
        accept="image/*"
        className="[&_.ant-upload-list-item-name]:text-foreground img-upload"
      >
        <Button variant="secondary" type="button" width="full">
          <UploadIcon /> Upload (Max: 1)
        </Button>
      </Upload>
    </div>
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
    <FileUpload
      onChange={(files: File[]) => {
        handleFileUpload({
          target: { files: [...files] }
        } as unknown as React.ChangeEvent<HTMLInputElement>)
      }}
    />
  )
}

export default CreatePostInput
