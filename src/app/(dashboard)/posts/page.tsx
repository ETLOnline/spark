"use client"

import { useState } from "react"
import CreatePostForm from "@/src/components/dashboard/posts/create-post-form"
import PostFeed from "@/src/components/dashboard/posts/post-feed"
import {
  Post,
  PostFile,
  PostPoll,
} from "@/src/components/dashboard/posts/types/posts-types.d"

const samplePosts: (Post | PostFile | PostPoll)[] = [
  {
    id: "1",
    author: { name: "Alice Johnson", avatar: "/avatars/01.png" },
    content:
      "Just finished a great book on AI! #ArtificialIntelligence #Reading",
    type: "text",
    likes: 15,
    comments: [
      {
        id: "c1",
        author: { name: "Bob Smith", avatar: "/avatars/02.png" },
        content: "What's the book called?",
        createdAt: "2023-04-15T11:30:00Z",
      },
    ],
    hashtags: ["ArtificialIntelligence", "Reading"],
    createdAt: "2023-04-15T10:30:00Z",
  },
  {
    id: "2",
    author: { name: "Bob Smith", avatar: "/avatars/02.png" },
    content:
      "https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png",
    type: "image",
    likes: 32,
    comments: [],
    hashtags: ["CodingSetup", "WorkFromHome"],
    createdAt: "2023-04-14T14:45:00Z",
  },
  {
    id: "3",
    author: { name: "Charlie Brown", avatar: "/avatars/03.png" },
    content: "What's your favorite programming language?",
    type: "poll",
    likes: 24,
    comments: [],
    hashtags: ["Programming", "DevLife"],
    createdAt: "2023-04-13T09:15:00Z",
    options: ["Python", "JavaScript"],
  },
  {
    id: "4",
    author: { name: "Charlie Brown", avatar: "/avatars/03.png" },
    content: "",
    type: "file",
    likes: 24,
    comments: [],
    hashtags: ["Programming", "DevLife"],
    createdAt: "2023-04-13T09:15:00Z",
    fileName: "brain.exe",
  },
]

const Posts: React.FC = () => {
  const [posts, setPosts] =
    useState<(Post | PostFile | PostPoll)[]>(samplePosts)

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-3xl">
      <CreatePostForm setPosts={setPosts} posts={posts} />
      <PostFeed posts={posts} setPosts={setPosts} />
    </div>
  )
}

export default Posts
