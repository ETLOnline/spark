import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { SelectComment } from "@/src/db/schema"

type Props = {
  comment: SelectComment
}

const PostComments: React.FC<Props> = (props) => {
  const name = `${props.comment.commentor.first_name} ${props.comment.commentor.last_name}`

  return (
    <div key={props.comment.id} className="flex items-start space-x-4">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={props.comment.commentor.profile_url as string}
          alt={name}
        />
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>
      <div className="rounded-[15px] bg-secondary p-3 pt-2">
        <p className="font-semibold">{name}</p>
        <p className="text-sm">{props.comment.content}</p>
      </div>
    </div>
  )
}

export default PostComments
