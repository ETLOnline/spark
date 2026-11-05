"use server"

import {
  AddPollOptions,
  CreatePost,
  LikePost,
  UnlikePost,
  CreateComment,
  VotePoll,
  SearchHashtags,
  CreateHashtags,
  AddHashtagToPostLink,
  UpdateHashTagsCount,
  GetPosts,
  GetPostById,
  DeletePost,
  AddPostFileLink,
  UpdatePost,
  RemoveHashtagFromPostLink,
  UpdatePollOption,
  DeletePollOption,
  UpdateComment,
  GetPostStatusById,
  HoldPostForReview
} from "@/src/db/data-access/post/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { TagStatus } from "@/src/components/TagsInput/tags-input-types"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { CreateFilePostParams } from "@/src/services/storage/types/interface"
import { NotificationEvent } from "@/src/services/notify/types/events"
import { SendPostLikeOrCommentNotification } from "@/src/services/notifications/Post/utlis"
import { GetSpaceById } from "@/src/db/data-access/spaces/query"
import moment from "moment"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { AddRewardAction } from "../Reward/Reward"
import { getPostUrl } from "@/src/utils/serverHelpers"
import { checkPost } from "@/src/services/ai/post/postCheck"
import { UploadedImage } from "@/src/services/ai/types/interface"
import { PostStatus } from "@/src/types/Post/PostStatus"
import { isSuperAdmin } from "@/src/utils/helpers"
import { rewardPublishedPost } from "@/src/services/post/postReview"

// Checks post text, poll options and images with AI before the post is saved.
// Held posts are still saved, as pending review with the AI result, until an admin approves or rejects them.
// `moderationFields` go on the post, `aiTags` are the tags to save on it, `message` is for the author when held.
const checkPostModeration = async (
  content?: string | null,
  pollOptions?: string[],
  images?: UploadedImage[]
) => {
  const moderation = await checkPost({ content, pollOptions, images })

  const moderationFields =
    moderation.publish || !moderation.moderationResult
      ? { status: PostStatus.PUBLISHED, moderation_result: null }
      : {
          status: PostStatus.PENDING_REVIEW,
          moderation_result: moderation.moderationResult
        }
  return {
    moderationFields,
    held: moderationFields.status === PostStatus.PENDING_REVIEW,
    aiTags: moderation.aiTags,
    message: moderation.message
  }
}

// Likes, comments and votes are only allowed on published posts
const assertPostPublished = async (postId: string) => {
  const post = await GetPostStatusById(postId)
  if (post?.status !== PostStatus.PUBLISHED) {
    throw new Error("Post is not published")
  }
}

export const CreatePostAction = CreateServerAction(
  true,
  async (
    content: string,
    type: string,
    category?: string,
    entityType?: string,
    entityId?: string
  ) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const { moderationFields, held, aiTags, message } =
          await checkPostModeration(content)

        const postData = await CreatePost({
          content,
          type,
          user_id: userId,
          category,
          entity_type: entityType,
          entity_id: entityId,
          ai_tags: aiTags,
          ...moderationFields
        })
        if (!held) await rewardPublishedPost(postData[0].id, userId, entityId)
        return { success: true, data: postData, message }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const UpdatePostAction = CreateServerAction(
  true,
  async (postId: string, content: string) => {
    try {
      const { moderationFields, held, aiTags, message } =
        await checkPostModeration(content)

      // a held edit sends the post back to review; a pending post stays pending until an admin
      // reviews it, since only the text is checked here and its images may be what held it
      const updatedPost = await UpdatePost(postId, content, {
        ai_tags: aiTags,
        ...(held ? moderationFields : {})
      })
      return { success: true, data: updatedPost, message }
    } catch (error: any) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const UpdatePollOptionsAction = CreateServerAction(
  true,
  async (postId: string, options: Array<{ id?: number; text: string }>) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (!userId) {
        throw new Error("Unauthorized", { cause: 401 })
      }

      // Get current post to check if it's a poll and get existing options
      const post = await GetPostById(postId)
      if (!post || post.type !== "poll") {
        throw new Error("Post is not a poll")
      }

      // Check if user is the post owner
      if (post.user_id !== userId) {
        throw new Error("Unauthorized: Only post owner can edit poll options")
      }

      // Check if there are any votes
      const hasVotes =
        post.options?.some(
          (opt) => (opt.vote_count ?? opt.votes?.length ?? 0) > 0
        ) ?? false

      if (hasVotes) {
        throw new Error("Cannot edit poll options after voting has started")
      }

      const { moderationFields, held, message } = await checkPostModeration(
        post.content,
        options.map((opt) => opt.text)
      )
      if (held) {
        await HoldPostForReview(postId, moderationFields.moderation_result!)
      }

      const existingOptions = post.options || []
      const existingOptionIds = existingOptions.map((opt) => opt.id)

      // Process options
      const optionsToUpdate: Array<{ id: number; text: string }> = []
      const optionsToCreate: Array<{ option_text: string; post_id: string }> =
        []
      const optionIdsToDelete: number[] = []

      // Find options to update, create, or delete
      for (const option of options) {
        if (option.id && existingOptionIds.includes(option.id)) {
          // Update existing option
          optionsToUpdate.push({ id: option.id, text: option.text })
        } else if (!option.id) {
          // Create new option
          optionsToCreate.push({
            option_text: option.text,
            post_id: postId
          })
        }
      }

      // Find options to delete (existing options not in the new list)
      for (const existingOption of existingOptions) {
        if (!options.some((opt) => opt.id === existingOption.id)) {
          optionIdsToDelete.push(existingOption.id)
        }
      }

      // Execute updates
      const updatePromises = optionsToUpdate.map((opt) =>
        UpdatePollOption(opt.id, opt.text)
      )
      const deletePromises = optionIdsToDelete.map((id) => DeletePollOption(id))

      await Promise.all([...updatePromises, ...deletePromises])

      if (optionsToCreate.length > 0) {
        await AddPollOptions(optionsToCreate)
      }

      // Fetch updated post
      const updatedPost = await GetPostById(postId)
      return { success: true, data: updatedPost, message }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to update poll options"
      }
    }
  }
)

export const CreateFilesPostAction = CreateServerAction(
  true,
  async (args: {
    type?: string
    files: Array<{
      fileName: string
      fileSize: number
      fileType: string
      fileBase64: string
    }>
    content?: string
    category?: string
    entityType?: string
    entityId?: string
    folderPath?: string
  }) => {
    const { files, content, category, entityType, entityId, folderPath, type } =
      args
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (!userId) throw new Error("Unauthorized", { cause: 401 })

      if (!files || files.length === 0) {
        throw new Error("No files provided")
      }

      // held files are still uploaded, so the admin can see them when reviewing the post
      const { moderationFields, held, aiTags, message } =
        await checkPostModeration(content, undefined, files)

      // If there are multiple files, treat it as an image post (existing behavior)
      if (files.length > 1) {
        // Create a single post for all images
        const postData = await CreatePost({
          type: type || "image",
          user_id: userId,
          content,
          category,
          entity_type: entityType,
          entity_id: entityId,
          ai_tags: aiTags,
          ...moderationFields
        })

        if (!postData || postData.length === 0) {
          throw new Error("Failed to create post")
        }

        const postId = postData[0].id
        const fileRecords: any[] = []

        for (const file of files) {
          const fileBuffer = base64ToBuffer(file.fileBase64)
          const { fileUrl, fileRecord } = await uploadFileAndSaveMetadata(
            fileBuffer,
            file.fileName,
            file.fileType,
            folderPath == "spaces" ? "spaces" : "posts"
          )

          await AddPostFileLink(postId, fileRecord.id)
          fileRecords.push({ ...fileRecord, url: fileUrl })
        }
        if (!held) await rewardPublishedPost(postId, userId, entityId)

        return {
          success: true,
          data: {
            ...postData[0],
            files: fileRecords,
            file:
              fileRecords && fileRecords.length > 0 ? fileRecords[0] : undefined
          },
          message
        }
      }

      // Single file case
      const single = files[0]
      const postType =
        type || (single.fileType?.startsWith("image/") ? "image" : "file")

      // Create post in DB
      const postData = await CreatePost({
        type: postType,
        user_id: userId,
        content,
        category,
        entity_type: entityType,
        entity_id: entityId,
        ai_tags: aiTags,
        ...moderationFields
      })

      if (!postData || postData.length === 0) {
        throw new Error("Failed to create post")
      }

      const fileBuffer = base64ToBuffer(single.fileBase64)
      const { fileUrl, fileRecord } = await uploadFileAndSaveMetadata(
        fileBuffer,
        single.fileName,
        single.fileType,
        folderPath == "spaces" ? "spaces" : "posts"
      )

      await AddPostFileLink(postData[0].id, fileRecord.id)

      return {
        success: true,
        data: {
          ...postData[0],
          file: fileRecord,
          files: [fileRecord],
          url: fileUrl
        },
        message
      }
    } catch (error: any) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const CreatePollPostAction = CreateServerAction(
  true,
  async (
    content: string,
    type: string,
    options: string[],
    category?: string,
    entityType?: string,
    entityId?: string,
    files?: Array<{
      fileName: string
      fileSize: number
      fileType: string
      fileBase64: string
    }>,
    folderPath?: string
  ) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        // text, options and images are checked together, so the poll is saved with the right
        // status and only rewarded when it is published. Held images are still uploaded for the admin.
        const { moderationFields, held, aiTags, message } =
          await checkPostModeration(content, options, files)

        const postData = await CreatePost({
          content,
          type,
          user_id: userId,
          category,
          entity_type: entityType,
          entity_id: entityId,
          ai_tags: aiTags,
          ...moderationFields
        })
        if (postData[0]) {
          const postId = postData[0].id
          const pollOptions = options.map((option) => {
            return { option_text: option, post_id: postId }
          })
          const pollOptionsData = await AddPollOptions(pollOptions)

          const fileRecords: any[] = []
          for (const file of files ?? []) {
            const fileBuffer = base64ToBuffer(file.fileBase64)
            const { fileUrl, fileRecord } = await uploadFileAndSaveMetadata(
              fileBuffer,
              file.fileName,
              file.fileType,
              folderPath == "spaces" ? "spaces" : "posts"
            )
            await AddPostFileLink(postId, fileRecord.id)
            fileRecords.push({ ...fileRecord, url: fileUrl })
          }

          const data = {
            ...postData[0],
            options: [...pollOptionsData],
            files: fileRecords
          }
          if (!held) await rewardPublishedPost(postId, userId, entityId)
          return { success: true, data, message }
        } else {
          throw new Error("Failed to create post")
        }
      }
    } catch (error: any) {
      return { success: false, error }
    }
  }
)

export const ToggleLikeAction = CreateServerAction(
  true,
  async (
    postId: string,
    isLiked: boolean,
    likes: number,
    space_id?: string
  ) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        await assertPostPublished(postId)
        if (isLiked) {
          const data = await UnlikePost(postId, userId, likes)
          return { success: true, data }
        } else {
          const data = await LikePost(postId, userId, likes)
          const PostWithAuther = await GetPostByIdAction(data.id)
          if (PostWithAuther.success && PostWithAuther.data) {
            const space = await GetSpaceById(space_id || "")
            SendPostLikeOrCommentNotification(
              NotificationEvent.POST_LIKE,
              PostWithAuther.data,
              space
            )
          }
          const { proof_url, communityId } = await getPostUrl(postId, space_id)
          await AddRewardAction(
            ActivityTypes.SocialPostLike,
            userId,
            proof_url,
            {
              community_id: communityId,
              post_id: postId
            },
            undefined,
            "post_id",
            postId
          )
          return { success: true, data }
        }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const CreateCommentAction = CreateServerAction(
  true,
  async (
    postId: string,
    content: string,
    comments: number,
    space_id?: string
  ) => {
    try {
      const user = await AuthUserAction()
      if (user?.unique_id) {
        await assertPostPublished(postId)
        const commentData = await CreateComment(
          {
            content,
            post_id: postId,
            user_id: user?.unique_id
          },
          comments
        )
        const PostWithAuther = await GetPostByIdAction(postId)
        if (PostWithAuther.success && PostWithAuther.data) {
          const space = await GetSpaceById(space_id || "")
          SendPostLikeOrCommentNotification(
            NotificationEvent.POST_COMMENT,
            PostWithAuther.data,
            space
          )
        }
        const { proof_url, communityId } = await getPostUrl(postId, space_id)
        await AddRewardAction(
          ActivityTypes.SocialPostComment,
          user?.unique_id,
          proof_url,
          { community_id: communityId }
        )
        return { success: true, data: { ...commentData, commentor: user } }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error
      }
    }
  }
)
export const UpdateCommentAction = CreateServerAction(
  true,
  async (commentId: number, newContent: string) => {
    try {
      const user = await AuthUserAction()
      if (user?.unique_id) {
        const commentData = await UpdateComment(commentId, newContent)

        return { success: true, data: { ...commentData, commentor: user } }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const VotePollAction = CreateServerAction(
  true,
  async (postId: string, optionText: string, voteCount: number) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        await assertPostPublished(postId)
        const voteData = await VotePoll(
          {
            user_id: userId,
            post_id: postId,
            option_text: optionText
          },
          voteCount
        )
        return { success: true, data: voteData }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to vote"
      }
    }
  }
)

export const GetPostsAction = CreateServerAction(
  true,
  async (offset?: number) => {
    try {
      const posts = await GetPosts({ offset, globalPostsOnly: true })
      const sanitizedPosts = posts.map((post) => ({
        ...post,
        hashtags: post.hashtags.map((hashtag) => hashtag.hashtag),
        files: post.files?.map((f: any) => f.postFile) || [],
        file:
          post.files && post.files.length > 0
            ? post.files[0].postFile
            : undefined
      }))

      // Merge consecutive posts from the same author with same type/content and close timestamps
      const mergedPosts: any[] = []
      for (const p of sanitizedPosts) {
        const last = mergedPosts[mergedPosts.length - 1]
        if (
          last &&
          last.author?.unique_id === p.author?.unique_id &&
          last.type === p.type &&
          (last.content || "").trim() === (p.content || "").trim() &&
          Math.abs(
            moment(last.created_at).valueOf() - moment(p.created_at).valueOf()
          ) <= 5000
        ) {
          last.files = [...(last.files || []), ...(p.files || [])]
          last.created_at = moment
            .min(moment(last.created_at), moment(p.created_at))
            .toISOString()
          last.file =
            last.files && last.files.length > 0 ? last.files[0] : last.file
        } else {
          mergedPosts.push({ ...p })
        }
      }
      return { success: true, data: mergedPosts }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch user posts"
      }
    }
  }
)

export const GetSpacePostsAction = CreateServerAction(
  true,
  async (
    spaceId: string,
    category: string = "",
    offset?: number,
    limit?: number
  ) => {
    try {
      const posts = await GetPosts({
        entityId: spaceId,
        category: category,
        offset,
        limit
      })
      const sanitizedPosts = posts.map((post) => ({
        ...post,
        hashtags: post.hashtags.map((hashtag) => hashtag.hashtag),
        files: post.files?.map((f: any) => f.postFile) || [],
        file:
          post.files && post.files.length > 0
            ? post.files[0].postFile
            : undefined
      }))

      // Merge consecutive space posts from the same author with same type/content and close timestamps
      const mergedPosts: any[] = []
      for (const p of sanitizedPosts) {
        const last = mergedPosts[mergedPosts.length - 1]
        if (
          last &&
          last.author?.unique_id === p.author?.unique_id &&
          last.type === p.type &&
          (last.content || "").trim() === (p.content || "").trim() &&
          Math.abs(
            moment(last.created_at).valueOf() - moment(p.created_at).valueOf()
          ) <= 5000
        ) {
          last.files = [...(last.files || []), ...(p.files || [])]
          last.created_at = moment
            .min(moment(last.created_at), moment(p.created_at))
            .toISOString()
          last.file =
            last.files && last.files.length > 0 ? last.files[0] : last.file
        } else {
          mergedPosts.push({ ...p })
        }
      }
      return { success: true, data: mergedPosts }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch user posts"
      }
    }
  }
)

// My Posts: the signed-in user's posts in every status (published, under review, rejected),
// either their global posts or their posts in one space
export const GetMyPostsAction = CreateServerAction(
  true,
  async (offset?: number, spaceId?: string, category: string = "") => {
    try {
      const user = await AuthUserAction()
      if (!user) throw new Error("Unauthorized", { cause: 401 })

      const posts = await GetPosts({
        offset,
        userIds: [user.unique_id],
        statuses: Object.values(PostStatus),
        ...(spaceId
          ? { entityId: spaceId, category }
          : { globalPostsOnly: true })
      })
      // any[], like the other feed actions, so the post cards accept it
      const sanitizedPosts: any[] = posts.map((post) => ({
        ...post,
        hashtags: post.hashtags.map((hashtag) => hashtag.hashtag),
        files: post.files?.map((f: any) => f.postFile) || [],
        file:
          post.files && post.files.length > 0
            ? post.files[0].postFile
            : undefined
      }))

      return { success: true, data: sanitizedPosts }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch your posts"
      }
    }
  }
)

export const LinkHashtagsToPostAction = CreateServerAction(
  true,
  async (
    postId: string,
    hashtags: { name: string; count?: number; status: TagStatus }[]
  ) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const newTags = hashtags.filter((tag) => tag.status === TagStatus.new)
        const existingTags = hashtags.filter(
          (tag) => tag.status !== TagStatus.new
        )
        const newHashtags = await CreateHashtags(newTags.map((tag) => tag.name))
        const existingHashtags = await UpdateHashTagsCount(existingTags)
        await AddHashtagToPostLink(
          [...newHashtags, ...existingHashtags],
          postId
        )
        return { success: true, data: [...newHashtags, ...existingHashtags] }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to link hashtags"
      }
    }
  }
)

export const UnlinkHashtagsFromPostAction = CreateServerAction(
  true,
  async (postId: string, hashtagIds: number[]) => {
    try {
      await RemoveHashtagFromPostLink(postId, hashtagIds)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to unlink hashtags"
      }
    }
  }
)

export const SearchHashtagsAction = CreateServerAction(
  false,
  async (searchTerm: string) => {
    try {
      const hashtags = await SearchHashtags(searchTerm)
      return {
        success: true,
        data: hashtags
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to search hashtags"
      }
    }
  }
)

export const DeletePostAction = CreateServerAction(
  true,
  async (postId: string) => {
    try {
      const deletedPost = await DeletePost(postId)
      return { success: true, data: deletedPost }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to delete post"
      }
    }
  }
)

// Published posts are public; any other post is seen only by its author (My Posts) and admins
const canViewPost = async (post: { status: string; user_id: string }) => {
  if (post.status === PostStatus.PUBLISHED) return true
  const viewer = await AuthUserAction().catch(() => undefined)
  if (!viewer) return false
  if (post.user_id === viewer.unique_id) return true
  return await isSuperAdmin(viewer)
}

export const GetPostByIdAction = CreateServerAction(
  false,
  async (postId: string) => {
    try {
      const post = await GetPostById(postId)
      if (post && (await canViewPost(post))) {
        const sanitizedPost = {
          ...post,
          hashtags: post.hashtags.map((hashtag) => hashtag.hashtag),
          files: post.files?.map((f: any) => f.postFile) || [],
          file:
            post.files && post.files.length > 0
              ? post.files[0].postFile
              : undefined
        }
        return { success: true, data: sanitizedPost }
      } else {
        return { success: false, error: "Post not found" }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch post"
      }
    }
  }
)
