"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Textarea } from "@/src/components/ui/textarea"
import { MessageCircle, ThumbsUp } from "lucide-react"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { useState } from "react"

interface Post {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  likes: number
  comments: number
  category: string
}

const samplePosts: Post[] = [
  {
    id: "1",
    author: { name: "Alice Johnson", avatar: "/avatars/01.png" },
    content:
      "Just finished reading 'Clean Code' by Robert C. Martin. Highly recommended for all developers!",
    likes: 15,
    comments: 3,
    category: "Programming"
  },
  {
    id: "2",
    author: { name: "Bob Smith", avatar: "/avatars/02.png" },
    content:
      "Check out this amazing AI-generated art I created using Midjourney!",
    likes: 32,
    comments: 7,
    category: "AI & Machine Learning"
  },
  {
    id: "3",
    author: { name: "Charlie Davis", avatar: "/avatars/03.png" },
    content:
      "Excited to announce that our open-source project hit 1000 stars on GitHub!",
    likes: 45,
    comments: 12,
    category: "Open Source"
  }
]

const categories = [
  "All",
  "Programming",
  "AI & Machine Learning",
  "Open Source",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "IoT"
]

const SpacesPage = () => {
  const [posts, setPosts] = useState<Post[]>(samplePosts)
  const [newPost, setNewPost] = useState({
    content: "",
    category: "Programming"
  })
  const [activeCategory, setActiveCategory] = useState("All")

  const handleCreatePost = () => {
    if (newPost.content.trim() === "") return
    const createdPost: Post = {
      id: (posts.length + 1).toString(),
      author: { name: "Current User", avatar: "/avatars/04.png" },
      content: newPost.content,
      likes: 0,
      comments: 0,
      category: newPost.category
    }
    setPosts([createdPost, ...posts])
    setNewPost({ content: "", category: "Programming" })
  }

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                // id="category"
                value={newPost.category}
                onValueChange={(value) =>
                  setNewPost({ ...newPost, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreatePost}>Create Post</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Latest posts from {activeCategory}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-24rem)]">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="mb-4">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {post.author.name}
                      </CardTitle>
                      <CardDescription>{post.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{post.content}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-4">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {post.comments}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}

export default SpacesPage
