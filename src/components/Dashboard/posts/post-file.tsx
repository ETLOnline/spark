import { FileIcon } from "lucide-react"
import { SelectFilePost } from "@/src/db/schema"
import Link from "next/link"

type Props = {
  post: SelectFilePost
}

const FilePost: React.FC<Props> = ({ post }) => {
  return (
    <Link href={post.file.file_path}>
      <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg">
        <FileIcon className="h-8 w-8" />
        <span className="font-medium">{post.file.file_name}</span>
      </div>
    </Link>
  )
}

export default FilePost
