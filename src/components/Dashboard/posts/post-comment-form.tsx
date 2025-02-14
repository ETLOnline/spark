"use client"

import { Button } from "@/src/components/ui/button"
import { useRef } from "react"
import { Input } from "@/src/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { postStore } from "@/src/store/post/postStore"
import { useAtom } from "jotai"

type Props = {
  postId: number
}

const PostCommentForm: React.FC<Props> = ({ postId }) => {
  const commentText = useRef<string>("")

  const [posts, setPosts] = useAtom(postStore.posts)

  const handleAddComment = (postId: number) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments]
        }
      }
      return post
    })
    commentText.current = ""
  }

  return (
    <div className="flex items-center w-full space-x-2">
      <Avatar className="h-8 w-8 mt-4">
        <AvatarImage src="/avatars/04.png" alt="Current User" />
        <AvatarFallback>CU</AvatarFallback>
      </Avatar>
      <Input
        placeholder="Add a comment..."
        onChange={(e) => (commentText.current = e.target.value)}
        className="flex-1"
      />
      <Button
        onClick={() => handleAddComment(postId)}
        size="sm"
        className="mt-4"
      >
        Comment
      </Button>
    </div>
  )
}

export default PostCommentForm
