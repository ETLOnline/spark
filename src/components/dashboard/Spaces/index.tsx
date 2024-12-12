'use client'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"
import { MessageCircle, ThumbsUp, TrendingUp, Users, Calendar } from 'lucide-react'
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"

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
    content: "Just finished reading 'Clean Code' by Robert C. Martin. Highly recommended for all developers!",
    likes: 15,
    comments: 3,
    category: "Programming",
  },
  {
    id: "2",
    author: { name: "Bob Smith", avatar: "/avatars/02.png" },
    content: "Check out this amazing AI-generated art I created using Midjourney!",
    likes: 32,
    comments: 7,
    category: "AI & Machine Learning",
  },
  {
    id: "3",
    author: { name: "Charlie Davis", avatar: "/avatars/03.png" },
    content: "Excited to announce that our open-source project hit 1000 stars on GitHub!",
    likes: 45,
    comments: 12,
    category: "Open Source",
  },
]

const categories = ["All", "Programming", "AI & Machine Learning", "Open Source", "Web Development", "Mobile Development", "Data Science", "DevOps", "Cybersecurity", "Blockchain", "IoT"]

const trendingTopics = [
  { name: "React Hooks", posts: 120 },
  { name: "GPT-4", posts: 98 },
  { name: "Kubernetes", posts: 85 },
  { name: "Web3", posts: 72 },
  { name: "Flutter", posts: 65 },
]

const upcomingEvents = [
  { name: "TechConf 2023", date: "2023-09-15" },
  { name: "AI Summit", date: "2023-10-02" },
  { name: "DevOps Day", date: "2023-10-20" },
]

export function SpacesScreen() {
  const [posts, setPosts] = useState<Post[]>(samplePosts)
  const [newPost, setNewPost] = useState({ content: "", category: "Programming" })
  const [activeCategory, setActiveCategory] = useState("All")

  const handleCreatePost = () => {
    if (newPost.content.trim() === "") return
    const createdPost: Post = {
      id: (posts.length + 1).toString(),
      author: { name: "Current User", avatar: "/avatars/04.png" },
      content: newPost.content,
      likes: 0,
      comments: 0,
      category: newPost.category,
    }
    setPosts([createdPost, ...posts])
    setNewPost({ content: "", category: "Programming" })
  }

  const filteredPosts = activeCategory === "All" ? posts : posts.filter(post => post.category === activeCategory)

  return (
    <div className=" flex flex-col space-y-4">
      <div className="flex space-x-4">
        <Card className="flex-grow">
          <CardHeader className="pb-2">
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-2 p-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    onClick={() => setActiveCategory(category)}
                    className="flex-shrink-0"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex-grow flex space-x-4">
        <div className="w-3/4 space-y-4">
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
                    onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(category => category !== "All").map((category) => (
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
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
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
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{post.author.name}</CardTitle>
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
        </div>

        <div className="w-1/4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {trendingTopics.map((topic, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                      {topic.name}
                    </span>
                    <Badge variant="secondary">{topic.posts} posts</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {upcomingEvents.map((event, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{event.name}</span>
                    <Badge variant="outline">
                      <Calendar className="mr-1 h-3 w-3" />
                      {event.date}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    Total Members
                  </span>
                  <span className="font-bold">10,542</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                    Posts Today
                  </span>
                  <span className="font-bold">237</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    New Members (This Week)
                  </span>
                  <span className="font-bold">89</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

