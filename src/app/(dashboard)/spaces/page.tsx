"use client"

import CreatePostForm from "@/src/components/Dashboard/create-post-form"
import PostFeed from "@/src/components/Dashboard/post-feed"
import {
  Post,
  PostFile,
  PostPoll
} from "@/src/components/Dashboard/Posts/types/posts-types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/src/components/ui/card"
import { useState } from "react"

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
        createdAt: "2023-04-15T11:30:00Z"
      }
    ],
    hashtags: ["ArtificialIntelligence", "Reading"],
    createdAt: "2023-04-15T10:30:00Z"
  },
  {
    id: "2",
    author: { name: "Bob Smith", avatar: "/avatars/02.png" },
    content:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJkk-ipl11piZ92Mn50FEqLnJRF00-mcDRVg&s",
    type: "image",
    likes: 32,
    comments: [],
    hashtags: ["CodingSetup", "WorkFromHome"],
    createdAt: "2023-04-14T14:45:00Z"
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
    options: ["Python", "JavaScript"]
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
    fileName: "brain.exe"
  }
]

const SpacesPage: React.FC = () => {
  const [posts, setPosts] =
    useState<(Post | PostFile | PostPoll)[]>(samplePosts)
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div className="container mx-auto space-y-8">
      <CreatePostForm setPosts={setPosts} posts={posts} variant="spaces" />
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Latest posts from {activeCategory}</CardDescription>
        </CardHeader>
        <CardContent>
          <PostFeed posts={posts} setPosts={setPosts} />
        </CardContent>
      </Card>
    </div>
  )
}

export default SpacesPage
