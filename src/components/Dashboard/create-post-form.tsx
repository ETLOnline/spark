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
import { NewPost, PostType } from "./posts/types/posts-types.d"
import CreatePostInput from "./posts/create-post-input"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import {
  SelectFilePost,
  SelectPollPost,
  SelectPost,
  SelectUser
} from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import TagsInput from "../TagsInput/TagsInput"
import { userStore } from "@/src/store/user/userStore"
import {
  CreateFilePostAction,
  CreatePollPostAction,
  CreatePostAction,
  LinkHashtagsToPostAction
} from "@/src/server-actions/Post/Post"
import useHashtags from "./profile/hooks/useHashtags"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useSearchParams } from "next/navigation"

type Props = {
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

const CreatePostForm: React.FC<Props> = ({ variant = "posts" }) => {
  const searchParams = useSearchParams()
  const spaceId = searchParams.get("space_id")

  const [newPost, setNewPost] = useState<NewPost>({
    content: "",
    type: PostType.text as PostType,
    hashtags: []
  })
  const [pollOptions, setPollOptions] = useState<string[]>([])

  const setPosts = useSetAtom(postStore.posts)
  const authUser = useAtomValue(userStore.AuthUser)
  const [activeCategory, setActiveCategory] = useAtom(spaceStore.activeCategory)

  const [
    hashtags,
    setHashtags,
    suggestions,
    searchTagsForUserInput,
    searchTagsLoading
  ] = useHashtags()

  const { toast } = useToast()

  const [createPostLoading, createdPost, createPostError, createPost] =
    useServerAction(CreatePostAction)
  const [
    createFilePostLoading,
    createdFilePost,
    createFilePostError,
    createFilePost
  ] = useServerAction(CreateFilePostAction)
  const [
    createPollPostLoading,
    createdPollPost,
    createPollPostError,
    createPollPost
  ] = useServerAction(CreatePollPostAction)
  const [
    linkHashtagsToPostLoading,
    linkedHashtags,
    linkHashtagsToPostError,
    linkHashtagsToPost
  ] = useServerAction(LinkHashtagsToPostAction)

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      let postData: SelectPost | SelectFilePost | SelectPollPost =
        {} as SelectPost
      if (newPost.type === PostType.text) {
        let linkedHashtags
        const post =
          variant === "spaces"
            ? await createPost(
                newPost.content as string,
                newPost.type,
                activeCategory,
                "space",
                spaceId as string
              )
            : await createPost(newPost.content as string, newPost.type)
        if (post && post.data && post.data[0]) {
          if (hashtags.length) {
            linkedHashtags = await linkHashtagsToPost(
              post.data[0].id,
              hashtags.length
                ? hashtags
                    .filter((tag) => !tag.deleted)
                    .map((tag) => {
                      return {
                        name: tag.name,
                        count: tag.count,
                        status: tag.status
                      }
                    })
                : []
            )
            if (linkedHashtags?.error) {
              console.error(
                "Error linking hashtags to post:",
                linkedHashtags.error
              )
            }
          }
          postData = {
            ...post.data[0],
            author: authUser as SelectUser,
            hashtags: linkedHashtags?.data?.length
              ? [...linkedHashtags?.data]
              : [],
            postComments: []
          }
        } else if (post?.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error creating post please try again!"
          })
        }
      } else if (newPost.type === PostType.poll) {
        let linkedHashtags
        const post =
          variant === "spaces"
            ? await createPollPost(
                newPost.content as string,
                newPost.type,
                pollOptions,
                activeCategory,
                "space",
                spaceId as string
              )
            : await createPollPost(
                newPost.content as string,
                newPost.type,
                pollOptions
              )
        setPollOptions([])
        if (post && post.data) {
          if (hashtags.length) {
            linkedHashtags = await linkHashtagsToPost(
              post.data.id,
              hashtags.length
                ? hashtags
                    .filter((tag) => !tag.deleted)
                    .map((tag) => {
                      return {
                        name: tag.name,
                        count: tag.count,
                        status: tag.status
                      }
                    })
                : []
            )
            if (linkedHashtags?.error) {
              console.error(
                "Error linking hashtags to post:",
                linkedHashtags.error
              )
            }
          }
          postData = {
            ...post.data,
            author: authUser as SelectUser,
            hashtags: linkedHashtags?.data?.length
              ? [...linkedHashtags?.data]
              : [],
            postComments: []
          }
        } else if (post?.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error creating post please try again!"
          })
        }
      } else if (
        newPost.type === PostType.file ||
        newPost.type === PostType.image
      ) {
        if (!newPost.fileBase64 || !newPost.fileName) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a file to upload"
          })
          return
        }
        const post =
          variant === "spaces"
            ? await createFilePost(
                newPost.type,
                newPost.fileSize as number,
                newPost.fileName as string,
                newPost.fileType as string,
                newPost.fileBase64,
                newPost.content,
                activeCategory,
                "space",
                spaceId as string
              )
            : await createFilePost(
                newPost.type,
                newPost.fileSize as number,
                newPost.fileName as string,
                newPost.fileType as string,
                newPost.fileBase64,
                newPost.content
              )
        if (post && post.data && post.data) {
          let linkedHashtags
          if (hashtags.length) {
            linkedHashtags = await linkHashtagsToPost(
              post.data.id,
              hashtags.length
                ? hashtags
                    .filter((tag) => !tag.deleted)
                    .map((tag) => {
                      return {
                        name: tag.name,
                        count: tag.count,
                        status: tag.status
                      }
                    })
                : []
            )
            if (linkedHashtags?.error) {
              console.error(
                "Error linking hashtags to post:",
                linkedHashtags.error
              )
            }
          }
          postData = {
            ...post.data,
            author: authUser as SelectUser,
            hashtags: linkedHashtags?.data?.length
              ? [...linkedHashtags?.data]
              : [],
            postComments: []
          }
        } else if (post?.error) {
          console.error("Error creating post:", post.error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error creating post please try again!"
          })
        }
      }
      setHashtags([])
      if (newPost.category) {
        setActiveCategory(newPost.category)
      }
      if (postData.id) {
        setPosts((posts) => [
          postData as unknown as SelectPost | SelectFilePost | SelectPollPost,
          ...posts
        ])
        toast({
          title: "Posted!",
          duration: 3000
        })
      }
      setNewPost({
        content: "",
        hashtags: []
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error creating post please try again!",
        duration: 3000
      })
    }
  }

  return (
    <Card className="bg-background shadow-lg">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create a Post</h2>
      </CardHeader>
      <form onSubmit={handleCreatePost}>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="poll">Poll</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>
            {variant === "spaces" ? (
              <div className="space-y-4 mt-4">
                <div>
                  <Select
                    defaultValue={
                      activeCategory === "All" ? "default" : activeCategory
                    }
                    value={newPost.category}
                    onValueChange={(value) =>
                      setNewPost({ ...newPost, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        ...categories
                          .filter((category) => category !== "All")
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          )),
                        <SelectItem
                          key={"default"}
                          value={"default"}
                          disabled
                          hidden
                        >
                          Select Category
                        </SelectItem>
                      ]}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
            <TabsContent value="text">
              <CreatePostInput
                type={PostType.text}
                setNewPost={setNewPost}
                newPost={newPost}
              />
            </TabsContent>
            <TabsContent value="image">
              <CreatePostInput
                type={PostType.image}
                setNewPost={setNewPost}
                newPost={newPost}
                key={createdFilePost?.data?.id}
              />
            </TabsContent>
            <TabsContent value="poll">
              <CreatePostInput
                type={PostType.poll}
                setNewPost={setNewPost}
                newPost={newPost}
                pollOptions={pollOptions}
                setPollOptions={setPollOptions}
              />
            </TabsContent>
            <TabsContent value="file">
              <CreatePostInput
                type={PostType.file}
                setNewPost={setNewPost}
                newPost={newPost}
                key={createdFilePost?.data?.id}
              />
            </TabsContent>
          </Tabs>
          <div className="mt-4">
            <Label htmlFor="hashtags">Hashtags</Label>
            <TagsInput
              autocomplete
              tags={hashtags}
              updateTags={setHashtags}
              onChange={searchTagsForUserInput}
              suggestions={suggestions}
              loadingSuggestions={searchTagsLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            type="submit"
            disabled={
              createPostLoading ||
              createFilePostLoading ||
              createPollPostLoading
            }
            loading={
              createPostLoading ||
              createFilePostLoading ||
              createPollPostLoading
            }
          >
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default CreatePostForm
