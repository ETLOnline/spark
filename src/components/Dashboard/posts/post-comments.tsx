import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Comment } from "./types/posts-types.d"

type Props = {
  comment: Comment
}

const PostComments: React.FC<Props> = (props) => {
  return (
    <div key={props.comment.id} className="flex items-start space-x-4">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={props.comment.author.avatar}
          alt={props.comment.author.name}
        />
        <AvatarFallback>{props.comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">{props.comment.author.name}</p>
        <p className="text-sm">{props.comment.content}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(props.comment.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default PostComments
