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
import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { NewPost, PostType } from "./types/posts-types"
import CreatePostInput from "./create-post-input"
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
import TagsInput from "../../TagsInput/TagsInput"
import { userStore } from "@/src/store/user/userStore"
import {
  CreatePollPostAction,
  CreatePostAction,
  CreateFilesPostAction,
  LinkHashtagsToPostAction,
  AttachImagesToPostAction
} from "@/src/server-actions/Post/Post"
import useHashtags from "../profile/hooks/useHashtags"
import { spaceStore } from "@/src/store/space/spaceStore"
import { categories } from "@/src/utils/constants"
import { Plus, X } from "lucide-react"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from "../../ui/alert-dialog"
import { AddRewardAction } from "@/src/server-actions/Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"

type Props = {
  variant?: "posts" | "spaces"
}

const CreatePostForm: React.FC<Props> = ({ variant = "posts" }) => {
  const [showCard, setShowCard] = useState(false)
  const [newPost, setNewPost] = useState<NewPost>({
    content: "",
    type: PostType.text as PostType,
    hashtags: []
  })
  const [pollOptions, setPollOptions] = useState<string[]>([])
  const [changeTabDialogOpen, setChangeTabDialogOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<PostType>(PostType.text)
  const [pendingTab, setPendingTab] = useState<PostType | null>(null)

  const setPosts = useSetAtom(postStore.posts)
  const authUser = useAtomValue(userStore.AuthUser)
  const [activeCategory, setActiveCategory] = useAtom(spaceStore.activeCategory)
  const currentSpace = useAtomValue(spaceStore.selectedSpace)

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
  const [rewardPostLoading, rewardPostcreated, rewardPostError, rewardPost] =
    useServerAction(AddRewardAction)

  const [
    createFilesPostLoading,
    createdFilesPost,
    createFilesPostError,
    createFilesPost
  ] = useServerAction(CreateFilesPostAction)
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
  const [
    attachImagesToPostLoading,
    attachedImages,
    attachImagesToPostError,
    attachImagesToPost
  ] = useServerAction(AttachImagesToPostAction)

  const { permissionChecker } = usePermissionChecker(
    variant == "spaces" ? "scoped" : "global",
    "SPACE",
    currentSpace?.id
  )
  const permissionNamespace =
    variant == "spaces" ? "space.posting.create" : "posting.create"
  const canCreate = permissionChecker
    ? permissionChecker?.canAccess(permissionNamespace)
    : false

  const resetForm = () => {
    setActiveTab(PostType.text)
    setNewPost({
      content: "",
      type: PostType.text,
      hashtags: [],
      images: [],
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      fileBase64: undefined
    })
    setPollOptions([])
    setHashtags([])
  }

  const hasUnsavedChanges = () =>
    !!(
      newPost.content?.trim() ||
      newPost.images?.length ||
      newPost.fileBase64 ||
      pollOptions.length ||
      hashtags.length
    )

  const isSpaceVariant = variant === "spaces"
  const entityType = isSpaceVariant ? "space" : ""
  const entityId = isSpaceVariant ? (currentSpace?.id ?? "") : ""
  const folderPath = isSpaceVariant ? "spaces" : "posts"
  const postCategory = isSpaceVariant ? newPost.category : ""

  const handleTabChange = (value: string) => {
    const nextTab = value as PostType

    if (hasUnsavedChanges()) {
      setPendingTab(nextTab)
      setChangeTabDialogOpen(true)
      return
    }

    setActiveTab(nextTab)
    setNewPost((p) => ({ ...p, type: nextTab }))
  }

  const handleCloseModal = () => {
    resetForm()
    setShowCard(false)
  }
  const validatePost = (
    post: typeof newPost,
    pollOptions: string[]
  ): string | null => {
    switch (post.type) {
      case PostType.text:
        if (!post.content?.trim()) return "Please write your post"
        break

      case PostType.poll:
        if (!post.content?.trim()) return "Enter your poll question"
        if (pollOptions.length < 2)
          return "Please add at least two poll options"
        break

      case PostType.file:
        if (!post.fileBase64 || !post.fileName)
          return "Please select a file to upload"
        break

      case PostType.image:
        if (!post.images || post.images.length === 0)
          return "Please select at least one image to upload"
        break
    }
    return null
  }
  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!authUser?.unique_id){
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error creating post please try again!"
      })
      return
    }
    try {
      let postData: SelectPost | SelectFilePost | SelectPollPost =
        {} as SelectPost

      const errorMessage = validatePost(newPost, pollOptions)
      if (errorMessage) {
        toast({
          title: errorMessage,
          description: "Error creating post, please try again!"
        })
        return
      }

      if (newPost.type === PostType.text) {
        let linkedHashtags
        const post =
          variant === "spaces"
            ? await createPost(
                newPost.content as string,
                newPost.type,
                newPost.category,
                "space",
                currentSpace?.id
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
              toast({
                variant: "destructive",
                title: "Error",
                description: "Error linking hashtags to post"
              })
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
          return
        }
      } else if (newPost.type === PostType.poll) {
        let linkedHashtags

        // Create poll with options first
        const pollPost =
          variant === "spaces"
            ? await createPollPost(
                newPost.content as string,
                newPost.type,
                pollOptions,
                newPost.category,
                "space",
                currentSpace?.id
              )
            : await createPollPost(
                newPost.content as string,
                newPost.type,
                pollOptions
              )
        setPollOptions([])

        if (pollPost && pollPost.data) {
          const postId = pollPost.data.id
          let pollWithImages: SelectPollPost = {
            ...pollPost.data,
            author: authUser as SelectUser
          } as SelectPollPost

          // If poll has images, attach them to the post
          if (newPost.images && newPost.images.length > 0) {
            const imageData = newPost.images.map((image) => ({
              fileName: image.name,
              fileSize: image.size,
              fileType: image.type,
              fileBase64: image.base64
            }))

            const imagesResult = await attachImagesToPost({
              postId,
              files: imageData,
              folderPath: "posts"
            })

            if (imagesResult?.success && imagesResult.data) {
              pollWithImages = {
                ...pollPost.data,
                author: authUser as SelectUser,
                files: imagesResult.data
              } as SelectPollPost
            }
          }

          if (hashtags.length) {
            linkedHashtags = await linkHashtagsToPost(
              postId,
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
              toast({
                variant: "destructive",
                title: "Error",
                description: "Error linking hashtags to post"
              })
            }
          }

          postData = {
            ...pollWithImages,
            author: authUser as SelectUser,
            hashtags: linkedHashtags?.data?.length
              ? [...linkedHashtags?.data]
              : [],
            postComments: []
          } as SelectPollPost
        } else if (pollPost?.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error creating post please try again!"
          })
          return
        }
      } else if (
        newPost.type === PostType.file ||
        newPost.type === PostType.image
      ) {
        // Handle image posts with multiple images
        if (newPost.type === PostType.image) {
          if (!newPost.images || newPost.images.length === 0) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Please select at least one image to upload"
            })
            return
          }

          // Create ONE post for all images
          const imageData = newPost.images.map((image) => ({
            fileName: image.name,
            fileSize: image.size,
            fileType: image.type,
            fileBase64: image.base64
          }))

          const imagePostData = {
            files: imageData,
            type: PostType.image,
            content: (newPost.content as string) || "",
            category: newPost.category,
            entityType,
            entityId,
            folderPath
          }

          const post = await createFilesPost(imagePostData)

          if (post && post.data) {
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
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Error linking hashtags to post"
                })
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
            return
          }
        } else if (newPost.type === PostType.file) {
          // Handle file posts (single file)
          if (!newPost.fileBase64 || !newPost.fileName) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Please select a file to upload"
            })
            return
          }

          const filePostData = {
            type: newPost.type,
            fileSize: newPost.fileSize as number,
            fileName: newPost.fileName as string,
            fileType: newPost.fileType as string,
            fileBase64: newPost.fileBase64,
            content: newPost.content,
            category: postCategory,
            entityType,
            entityId,
            folderPath
          }

          const post = await createFilesPost({
            ...filePostData,
            files: [
              {
                fileName: filePostData.fileName,
                fileSize: filePostData.fileSize,
                fileType: filePostData.fileType,
                fileBase64: filePostData.fileBase64
              }
            ]
          })

          if (post && post.data) {
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
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Error linking hashtags to post"
                })
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
            return
          }
        }
      }
      setHashtags([])
      if (postData.id) {
        setPosts((posts) => [
          postData as unknown as SelectPost | SelectFilePost | SelectPollPost,
          ...posts
        ])
        toast({
          title: "Posted!",
          duration: 3000
        })

        setShowCard(false)
      }

      setNewPost({
        content: "",
        hashtags: [],
        images: []
      })
      setPollOptions([])
      let prrof_url = createAbsoluteUrl(`/posts/${postData.id}`)
      if (variant == "spaces"){
        prrof_url = createAbsoluteUrl(`/channels/${currentSpace?.channel?.channel_slug}/spaces/${currentSpace?.space_slug}?page-type=posts&post-id=${postData.id}`)
      }

      await rewardPost(ActivityTypes.SocialPost,authUser?.unique_id,prrof_url)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error creating post please try again!",
        duration: 3000
      })
    }
  }

  return (
    <div>
      {!showCard ? (
        canCreate ? (
          <Button
            className="rounded-lg relative w-36 h-10 cursor-pointer flex items-center border group overflow-hidden"
            onClick={() => setShowCard(true)}
          >
            <span className="font-semibold transform mr-3 group-hover:translate-x-20 transition-all duration-300">
              Add Post
            </span>
            <span className="absolute right-0 h-full w-10 rounded-lg bg-primary flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
              <Plus className="w-8" />
            </span>
          </Button>
        ) : null
      ) : (
        <Card className="bg-background shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <h2 className="text-2xl font-bold">Create a Post</h2>
            <Button variant="outline" size="icon" onClick={handleCloseModal}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <form onSubmit={handleCreatePost}>
            <CardContent>
              <Tabs
                value={activeTab}
                className="w-full"
                onValueChange={handleTabChange}
              >
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
                    key={createdFilesPost?.data?.id}
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
                    key={createdFilesPost?.data?.id}
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
                  createFilesPostLoading ||
                  createPollPostLoading ||
                  attachImagesToPostLoading
                }
                loading={
                  createPostLoading ||
                  createFilesPostLoading ||
                  createPollPostLoading ||
                  attachImagesToPostLoading
                }
              >
                Post
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      <AlertDialog
        open={changeTabDialogOpen}
        onOpenChange={setChangeTabDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved content. Switching post types will discard all
              changes including selected files and images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingTab(null)
                setChangeTabDialogOpen(false)
                setActiveTab((t) => t)
              }}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (!pendingTab) return

                resetForm()
                setActiveTab(pendingTab)
                setNewPost((p) => ({ ...p, type: pendingTab }))
                setPendingTab(null)
                setChangeTabDialogOpen(false)
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CreatePostForm
