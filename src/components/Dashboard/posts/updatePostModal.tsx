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
  UpdatePostAction,
  UpdatePollOptionsAction,
  GetPostByIdAction
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
import { Input } from "../../ui/input"

interface UpdatePostModalProps {
  selectedPost: SelectPost
  openDialog: boolean
  setOpenDialog: (open: boolean) => void
  variant?: "posts" | "spaces"
}

const postContentZodSchema = z
  .object({
    content: z.string().optional(),
    type: z.enum([PostType.text, PostType.poll, PostType.file, PostType.image]),
    options: z
      .array(
        z.object({
          id: z.number().optional(),
          text: z.string().min(1, "Option cannot be empty")
        })
      )
      .optional()
  })
  .refine(
    (data) => {
      if (data.type === PostType.poll) {
        return data.options && data.options.length >= 2
      }
      return true
    },
    {
      path: ["options"],
      message: "Poll must have at least two options"
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
  const [updatePollOptionsLoading, , , updatePollOptions] = useServerAction(
    UpdatePollOptionsAction
  )
  const [, , , getPostById] = useServerAction(GetPostByIdAction)
  const [linkHashtagsToPostLoading, , , linkHashtagsToPost] = useServerAction(
    LinkHashtagsToPostAction
  )
  const [unlinkHashtagsFromPostLoading, , , unlinkHashtagsFromPost] =
    useServerAction(UnlinkHashtagsFromPostAction)

  const form = useForm({
    resolver: zodResolver(postContentZodSchema),
    defaultValues: {
      content: selectedPost.content || "",
      type: selectedPost.type as PostType,
      options:
        selectedPost.type === PostType.poll && selectedPost.options
          ? selectedPost.options.map((opt) => ({
              id: opt.id,
              text: opt.option_text
            }))
          : []
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
    if (!selectedPost) return

    form.setValue("content", selectedPost.content || "")

    // Set poll options if it's a poll
    if (selectedPost.type === PostType.poll && selectedPost.options) {
      form.setValue(
        "options",
        selectedPost.options.map((opt) => ({
          id: opt.id,
          text: opt.option_text
        }))
      )
    }

    // Set hashtags
    if (selectedPost.hashtags) {
      const formatted = selectedPost.hashtags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        status: TagStatus.selected,
        count: tag.count || 0
      }))

      setHashtags(formatted)
    }
  }, [selectedPost])

  const isPoll = selectedPost.type === PostType.poll

  const pollVotesCount =
    selectedPost.options?.reduce(
      (acc, opt) => acc + (opt.vote_count ?? opt.votes?.length ?? 0),
      0
    ) ?? 0

  const canEditPoll = isPoll && pollVotesCount === 0

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

      // Update poll options if it's a poll and can be edited
      let updatedPollOptions = null
      if (
        isPoll &&
        canEditPoll &&
        data.options &&
        Array.isArray(data.options)
      ) {
        const pollOptionsResult = await updatePollOptions(
          selectedPost.id,
          data.options
        )

        if (!pollOptionsResult?.success) {
          throw new Error(
            pollOptionsResult?.error || "Failed to update poll options"
          )
        }

        // Fetch updated post with poll options
        const updatedPostResult = await getPostById(selectedPost.id)
        if (updatedPostResult?.success && updatedPostResult.data) {
          updatedPollOptions = updatedPostResult.data.options
        }
      }

      if (newPostContent?.success && newPostContent.data) {
        setPost((posts) =>
          posts.map((post) =>
            post.id === selectedPost.id
              ? ({
                  ...post,
                  content: newPostContent.data.content,
                  hashtags: updatedHashtags,
                  ...(isPoll && canEditPoll && updatedPollOptions
                    ? { options: updatedPollOptions }
                    : {})
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
    updatePollOptionsLoading ||
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
          {/* TEXT POST */}
          {!isPoll && (
            <>
              {/* Content */}
              <div>
                <Label htmlFor="content">Content</Label>
                <Controller
                  name="content"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <Textarea {...field} />
                      <div className="text-red-500 text-sm">
                        {error.content?.message}
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Hashtags */}
              <div className="mt-2">
                <Label>Hashtags</Label>
                <TagsInput
                  autocomplete
                  tags={hashtags}
                  updateTags={setHashtags}
                  onChange={searchTagsForUserInput}
                  suggestions={suggestions}
                  loadingSuggestions={searchTagsLoading}
                />
              </div>
            </>
          )}

          {/* POLL POST */}
          {isPoll && (
            <div className="mt-4 space-y-4">
              {!canEditPoll && (
                <p className="text-sm text-muted-foreground">
                  Poll Question, options, and hashtags cannot be edited after
                  voting has started.
                </p>
              )}

              {canEditPoll && (
                <>
                  {/* Poll Question */}
                  <div>
                    <Label>Question</Label>
                    <Controller
                      name="content"
                      control={form.control}
                      render={({ field }) => <Textarea {...field} />}
                    />
                  </div>

                  {/* Poll Options */}
                  <div className="space-y-2">
                    <Label>Poll Options</Label>

                    <Controller
                      name="options"
                      control={form.control}
                      render={({ field }) => {
                        const options = field.value || []
                        return (
                          <>
                            {options.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={option.text}
                                  onChange={(e) => {
                                    const updated = [...options]
                                    updated[index].text =
                                      e.target.value.toUpperCase()
                                    field.onChange(updated)
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={options.length <= 2}
                                  onClick={() =>
                                    field.onChange(
                                      options.filter((_, i) => i !== index)
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                field.onChange([...options, { text: "" }])
                              }
                            >
                              Add Option
                            </Button>
                          </>
                        )
                      }}
                    />
                  </div>

                  {/* Hashtags */}
                  <div>
                    <Label>Hashtags</Label>
                    <TagsInput
                      autocomplete
                      tags={hashtags}
                      updateTags={setHashtags}
                      onChange={searchTagsForUserInput}
                      suggestions={suggestions}
                      loadingSuggestions={searchTagsLoading}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button disabled={isPoll && !canEditPoll} loading={loading}>
              Update Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePostModal
