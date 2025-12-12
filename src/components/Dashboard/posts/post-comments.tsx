import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { SelectComment } from "@/src/db/schema"
import { formatRelativeTime } from "@/src/utils/helpers"
import ExpandableText from "./ExpandableText"

type Props = {
  comment: SelectComment
}

const PostComments: React.FC<Props> = ({ comment }) => {
  const name = `${comment.commentor.first_name} ${comment.commentor.last_name}`

  return (
    <div className="rounded-[15px] bg-card flex flex-col w-full gap-2 pb-1">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.commentor.profile_url as string}
            alt={name}
          />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>

        <div>
          <p className="font-bold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground/75">
            {formatRelativeTime(comment.created_at || "")}
          </p>
        </div>
      </div>

      <ExpandableText content={comment.content} lines={3} />
    </div>
  )
}

export default PostComments
