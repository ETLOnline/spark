"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { Textarea } from "../ui/textarea"
import { NewPost, Post, PostFile, PostPoll, PostType } from "./posts/types/posts-types"
import CreatePostInput from "./posts/create-post-input"

type Props = {
  setPosts: (posts: (Post | PostFile | PostPoll)[]) => void
  posts: (Post | PostFile | PostPoll)[]
  variant?: "posts" | "spaces"
}

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

const CreatePostForm: React.FC<Props> = ({
  setPosts,
  posts,
  variant = "posts"
}) => {
  const [newPost, setNewPost] = useState<NewPost>({
    content: "",
    type: "text" as PostType,
    hashtags: []
  })

  const handleCreatePost = () => {
    const tempNewPostObj: Post = {
      id: (posts.length + 1).toString(),
      author: { name: "Current User", avatar: "/avatars/04.png" },
      content: newPost.content as string,
      type: newPost.type,
      likes: 0,
      comments: [],
      hashtags: newPost.hashtags.filter((tag: string) => tag.trim() !== ""),
      createdAt: new Date().toISOString()
    }
    const newPostObj: Post | PostFile | PostPoll = newPost.fileName
      ? ({
          ...tempNewPostObj,
          content: newPost.content as File,
          fileName: newPost.fileName as string,
          fileSize: newPost.fileSize as number
        } as PostFile)
      : newPost.options
      ? ({
          ...tempNewPostObj,
          options: newPost.options
        } as PostPoll)
      : ({
          ...tempNewPostObj
        } as Post)

    setPosts([newPostObj, ...posts])
    setNewPost({ content: "", type: "text", hashtags: [] })
  }

  return (
    <Card className="bg-background shadow-lg">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create a Post</h2>
      </CardHeader>
      <CardContent>
        {variant === "posts" ? (
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="poll">Poll</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <CreatePostInput
                type="text"
                setNewPost={setNewPost}
                newPost={newPost}
              />
            </TabsContent>
            <TabsContent value="image">
              <CreatePostInput
                type="image"
                setNewPost={setNewPost}
                newPost={newPost}
              />
            </TabsContent>
            <TabsContent value="poll">
              <CreatePostInput
                type="poll"
                setNewPost={setNewPost}
                newPost={newPost}
              />
            </TabsContent>
            <TabsContent value="file">
              <CreatePostInput
                type="file"
                setNewPost={setNewPost}
                newPost={newPost}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                // id="category"
                value={newPost.category}
                onValueChange={
                  (value) => setNewPost({ ...newPost, category: value })
                  // TODO: set active category after state management is integrated
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
                value={newPost.content as string}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        )}
        {variant === "posts" && (
          <div className="mt-4">
            <Label htmlFor="hashtags">Hashtags (space-separated)</Label>
            <Input
              id="hashtags"
              placeholder="Enter hashtags (e.g., coding webdev)"
              onChange={(e) =>
                setNewPost({
                  ...newPost,
                  hashtags: e.target.value.split(" ")
                })
              }
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreatePost}>Post</Button>
      </CardFooter>
    </Card>
  )
}

export default CreatePostForm
