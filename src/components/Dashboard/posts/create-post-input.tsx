import { Textarea } from "@/src/components/ui/textarea"
import { NewPost, PostType, ImageFile } from "./types/posts-types"
import TagsInput from "../../TagsInput/TagsInput"
import "./create-post-input.css"
import { FileUpload } from "../../ui/file-upload"
import { useState } from "react"

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
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([])

  const handleFiles = async (files: File[]) => {
    if (!files || files.length === 0) {
      setSelectedImages([])
      setNewPost({
        ...newPost,
        fileName: undefined,
        fileSize: undefined,
        fileType: undefined,
        fileBase64: undefined,
        images: undefined
      })
      return
    }

    if (type === PostType.image) {
      const imagePromises = files
        .filter((file) => file.type.startsWith("image/"))
        .map(
          (file) =>
            new Promise<ImageFile>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => {
                resolve({
                  id: Math.random().toString(36).substr(2, 9),
                  file,
                  base64: reader.result as string,
                  name: file.name,
                  size: file.size,
                  type: file.type
                })
              }
              reader.readAsDataURL(file)
            })
        )

      const processedImages = await Promise.all(imagePromises)
      setSelectedImages(processedImages)
      setNewPost({
        ...newPost,
        type: PostType.image,
        images: processedImages
      })
      return
    }

    const file = files[0]
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
          onChange={(files: File[]) => handleFiles(files)}
          accept="image/*"
          multiple={true}
          fileType="image"
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
        type={type}
      />
    </div>
  ) : (
    <div className="flex flex-col space-y-4">
      <FileUpload
        onChange={(files: File[]) => handleFiles(files)}
        fileType="file"
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
