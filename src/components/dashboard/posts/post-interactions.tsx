"use client"

import { Button } from "../../ui/button"
import { MessageCircle, Share2, ThumbsUp } from "lucide-react"

type Props = {
  likes: number
  comments: number
}

const PostInteractions:React.FC<Props> = (props) => {
  return (
    <div className="flex justify-between w-full">
      <Button variant="ghost" size="sm">
        <ThumbsUp className="mr-2 h-4 w-4" />
        {props.likes}
      </Button>
      <Button variant="ghost" size="sm">
        <MessageCircle className="mr-2 h-4 w-4" />
        {props.comments}
      </Button>
      <Button variant="ghost" size="sm">
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  )
}

export default PostInteractions
