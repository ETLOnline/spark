import { FileIcon } from "lucide-react"

type Props = {
  //   file: File
  fileName: string
}

const PostFile: React.FC<Props> = (props) => {
  return (
    <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg">
      <FileIcon className="h-8 w-8" />
      <span className="font-medium">{props.fileName}</span>
    </div>
  )
}

export default PostFile
