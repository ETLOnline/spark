import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"

import { SelectPost } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  LinkHashtagsToPostAction,
  UnlinkHashtagsFromPostAction,
  UpdatePostAction
} from "@/src/server-actions/Post/Post"
import { useSetAtom } from "jotai"
import useHashtags from "../profile/hooks/useHashtags"
import { Label } from "../../ui/label"
import TagsInput from "../../TagsInput/TagsInput"
import { Textarea } from "../../ui/textarea"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../../ui/button"
import { postStore } from "@/src/store/post/postStore"
import { TagStatus } from "../../TagsInput/tags-input-types"
import { PostType } from "./types/posts-types"

interface UpdatePostModalProps {
  selectedPost: SelectPost
  openDialog: boolean
  setOpenDialog: (open: boolean) => void
  variant?: "posts" | "spaces"
}

const postContentZodSchema = z
  .object({
    content: z.string().optional(),
    type: z
      .enum([PostType.text, PostType.poll, PostType.file, PostType.image])
      .optional()
  })
  .refine(
    (data) => {
      if (data.type === PostType.text || data.type === PostType.poll)
        return !!data.content?.trim()
      return true
    },
    {
      message: "Post content cannot be empty",
      path: ["content"]
    }
  )

function UpdatePostModal({
  selectedPost,
  openDialog,
  setOpenDialog,
  variant = "posts"
}: UpdatePostModalProps) {
  const [postContent, setPostContent] = useState(selectedPost.content || "")
  const setPost = useSetAtom(postStore.posts)

  const [updatePostLoading, , , updatePost] = useServerAction(UpdatePostAction)
  const [linkHashtagsToPostLoading, , , linkHashtagsToPost] = useServerAction(
    LinkHashtagsToPostAction
  )
  const [unlinkHashtagsFromPostLoading, , , unlinkHashtagsFromPost] =
    useServerAction(UnlinkHashtagsFromPostAction)

  const form = useForm({
    resolver: zodResolver(postContentZodSchema),
    defaultValues: {
      content: selectedPost.content || "",
      type: selectedPost.type as PostType
    }
  })

  const { toast } = useToast()

  const [
    hashtags,
    setHashtags,
    suggestions,
    searchTagsForUserInput,
    searchTagsLoading
  ] = useHashtags()

  useEffect(() => {
    if (!selectedPost || !selectedPost.hashtags) return

    form.setValue("content", selectedPost.content || "")

    const formatted = selectedPost.hashtags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      status: TagStatus.selected,
      count: tag.count || 0
    }))

    setHashtags(formatted)
  }, [selectedPost])

  const handleUpdatePost = async (data: any) => {
    try {
      const tagsAdded = hashtags.filter(
        (t) =>
          !t.deleted &&
          !(selectedPost.hashtags ?? []).some(
            (old) => old.name.toLowerCase() === t.name.toLowerCase()
          )
      )

      const tagsRemoved = hashtags
        .filter(
          (t) =>
            t.deleted === true &&
            !hashtags.some(
              (tag) =>
                tag.name.toLowerCase() === t.name.toLowerCase() &&
                tag.status === TagStatus.new
            )
        )
        .map((t) => t.id)

      // link tags
      if (tagsAdded.length > 0) {
        const linkTags = await linkHashtagsToPost(selectedPost.id, tagsAdded)
        if (linkTags?.success && linkTags.data) {
          const mapped = linkTags.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            status: TagStatus.selected,
            count: t.count || 0
          }))
        }
      }

      // unlink tags
      if (tagsRemoved.length > 0) {
        const unlinkTags = await unlinkHashtagsFromPost(
          selectedPost.id,
          tagsRemoved as number[]
        )
      }

      const updatedHashtags = [
        ...(selectedPost.hashtags ?? []).filter(
          (old) =>
            !hashtags.some(
              (t) =>
                t.deleted && t.name.toLowerCase() === old.name.toLowerCase()
            )
        ),
        ...hashtags.filter(
          (t) =>
            !t.deleted &&
            !selectedPost.hashtags?.some(
              (old) => old.name.toLowerCase() === t.name.toLowerCase()
            )
        )
      ]

      const newPostContent = await updatePost(selectedPost.id, data.content)

      if (newPostContent?.success && newPostContent.data) {
        setPost((posts) =>
          posts.map((post) =>
            post.id === selectedPost.id
              ? ({
                  ...post,
                  content: newPostContent.data.content,
                  hashtags: updatedHashtags
                } as unknown as SelectPost)
              : post
          )
        )

        toast({ title: "Success", description: "Post updated successfully!" })

        setOpenDialog(false)
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error Updating post please try again!"
      })
    }
  }

  const error = form.formState.errors

  const loading =
    updatePostLoading ||
    linkHashtagsToPostLoading ||
    unlinkHashtagsFromPostLoading

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Here you can edit your post details.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleUpdatePost)}
          className="flex flex-col gap-6"
        >
          <div>
            <Label htmlFor="content">Content</Label>
            <Controller
              name="content"
              defaultValue=""
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Textarea value={field.value} onChange={field.onChange} />
                  <div className="text-red-500 text-sm text-left">
                    {error.content?.message}
                  </div>
                </div>
              )}
            />
            <div className="mt-2">
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
          </div>
          <DialogFooter>
            <Button loading={loading}>Update Post</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePostModal
