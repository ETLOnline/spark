"use client"

import CreatePostForm from "@/src/components/Dashboard/create-post-form"
import PostFeed from "@/src/components/Dashboard/post-feed"
import {
  Post,
  PostFile,
  PostPoll
} from "@/src/components/Dashboard/posts/types/posts-types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/src/components/ui/card"
import { useState } from "react"

const SpacesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div className="container mx-auto space-y-8">
      {/* <CreatePostForm setPosts={setPosts} posts={posts} variant="spaces" /> */}
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Latest posts from {activeCategory}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <PostFeed posts={posts} setPosts={setPosts} /> */}
        </CardContent>
      </Card>
    </div>
  )
}

export default SpacesPage
