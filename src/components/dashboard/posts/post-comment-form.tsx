"use client"

import { Button } from "@/src/components/ui/button"
import { useState } from "react"
import { Input } from "@/src/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Post, PostPoll, PostFile } from "./types/posts-types"

type Props = {
  posts: (Post | PostFile | PostPoll)[]
  setPosts: (posts: (Post | PostFile | PostPoll)[]) => void
  postId: string
}

const PostCommentForm: React.FC<Props> = (props) => {
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})

  const handleAddComment = (postId: string) => {
    const updatedPosts = props.posts.map((post: Post | PostFile | PostPoll) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c${post.comments.length + 1}`,
              author: { name: "Current User", avatar: "/avatars/04.png" },
              content: newComment[postId] || "",
              createdAt: new Date().toISOString()
            }
          ]
        }
      }
      return post
    })
    props.setPosts(updatedPosts)
    setNewComment({ ...newComment, [postId]: "" })
  }

  return (
    <div className="flex items-center w-full space-x-2">
      <Avatar className="h-8 w-8 mt-4">
        <AvatarImage src="/avatars/04.png" alt="Current User" />
        <AvatarFallback>CU</AvatarFallback>
      </Avatar>
      <Input
        placeholder="Add a comment..."
        value={newComment[props.postId] || ""}
        onChange={(e) =>
          setNewComment({
            ...newComment,
            [props.postId]: e.target.value
          })
        }
        className="flex-1"
      />
      <Button
        onClick={() => handleAddComment(props.postId)}
        size="sm"
        className="mt-4"
      >
        Comment
      </Button>
    </div>
  )
}

export default PostCommentForm
