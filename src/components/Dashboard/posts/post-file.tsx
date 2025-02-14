import { FileIcon } from "lucide-react"
import { SelectFilePost } from "@/src/db/schema"

type Props = {
  post: SelectFilePost
}

const FilePost: React.FC<Props> = ({ post }) => {
  return (
    <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg">
      <FileIcon className="h-8 w-8" />
      <span className="font-medium">{post.fileName}</span>
    </div>
  )
}

export default FilePost
