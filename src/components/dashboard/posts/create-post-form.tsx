"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import PostInput from "./create-post-input"
import {
  Post,
  NewPost,
  PostType,
  PostPoll,
  PostFile,
} from "./types/posts-types.d"
import { useState } from "react"

type Props = {
  setPosts: (posts: (Post | PostFile | PostPoll)[]) => void
  posts: Post[]
}

const CreatePostForm: React.FC<Props> = (props) => {
  const [newPost, setNewPost] = useState<NewPost>({
    content: "",
    type: "text" as PostType,
    hashtags: [],
  })

  const handleCreatePost = () => {
    const newPostObj: Post | PostFile | PostPoll = {
      id: (props.posts.length + 1).toString(),
      author: { name: "Current User", avatar: "/avatars/04.png" },
      content: newPost.content,
      type: newPost.type,
      likes: 0,
      comments: [],
      hashtags: newPost.hashtags.filter((tag: string) => tag.trim() !== ""),
      createdAt: new Date().toISOString(),
      fileName: newPost.fileName,
      fileSize: newPost.fileSize,
    }
    props.setPosts([newPostObj, ...props.posts])
    setNewPost({ content: "", type: "text", hashtags: [] })
  }

  return (
    <Card className="bg-background shadow-lg">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create a Post</h2>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="poll">Poll</TabsTrigger>
            <TabsTrigger value="file">File</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <PostInput type="text" setNewPost={setNewPost} newPost={newPost} />
          </TabsContent>
          <TabsContent value="image">
            <PostInput type="image" setNewPost={setNewPost} newPost={newPost} />
          </TabsContent>
          <TabsContent value="poll">
            <PostInput type="poll" setNewPost={setNewPost} newPost={newPost} />
          </TabsContent>
          <TabsContent value="file">
            <PostInput type="file" setNewPost={setNewPost} newPost={newPost} />
          </TabsContent>
        </Tabs>
        <div className="mt-4">
          <Label htmlFor="hashtags">Hashtags (space-separated)</Label>
          <Input
            id="hashtags"
            placeholder="Enter hashtags (e.g., coding webdev)"
            onChange={(e) =>
              setNewPost({
                ...newPost,
                hashtags: e.target.value.split(" "),
              })
            }
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreatePost}>Post</Button>
      </CardFooter>
    </Card>
  )
}

export default CreatePostForm
