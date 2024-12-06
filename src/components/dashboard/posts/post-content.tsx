import { FileIcon } from "lucide-react"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import Image from "next/image"
import { PostType } from "./types/posts-types"

type Props = {
  type: PostType
  content: string
  options?: string[]
}

const PostContent: React.FC<Props> = (props) => {
  return (
    <>
      {props.type === "text" && <p className="text-lg">{props.content}</p>}
      {props.type === "image" && (
        <Image
          src={props.content}
          alt="Post image"
          className="rounded-lg max-h-96 w-full object-cover"
          width={1000}
          height={1000}
        />
      )}
      {props.type === "poll" && (
        <div>
          <p className="font-semibold mb-2">{props.content}</p>
          <RadioGroup>
            {props.options?.map((option) => (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      {props.type === "file" && (
        <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg">
          <FileIcon className="h-8 w-8" />
          <span className="font-medium">Attached File</span>
        </div>
      )}
    </>
  )
}

export default PostContent
