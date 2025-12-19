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
  RemoveHashtagFromPostLink
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
        const postData = await CreatePost({
          content,
          type,
          user_id: userId,
          category,
          entity_type: entityType,
          entity_id: entityId
        })
        return { success: true, data: postData }
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
      const updatedPost = await UpdatePost(postId, content)
      return { success: true, data: updatedPost }
    } catch (error: any) {
      return {
        success: false,
        error: error
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

      // If there are multiple files, treat it as an image post (existing behavior)
      if (files.length > 1) {
        // Create a single post for all images
        const postData = await CreatePost({
          type: type || "image",
          user_id: userId,
          content,
          category,
          entity_type: entityType,
          entity_id: entityId
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

        return {
          success: true,
          data: {
            ...postData[0],
            files: fileRecords,
            file:
              fileRecords && fileRecords.length > 0 ? fileRecords[0] : undefined
          }
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
        entity_id: entityId
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
        }
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
    entityId?: string
  ) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const postData = await CreatePost({
          content,
          type,
          user_id: userId,
          category,
          entity_type: entityType,
          entity_id: entityId
        })
        if (postData[0]) {
          const pollOptions = options.map((option) => {
            return { option_text: option, post_id: postData[0].id }
          })
          const pollOptionsData = await AddPollOptions(pollOptions)
          const data = { ...postData[0], options: [...pollOptionsData] }
          return { success: true, data }
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

export const GetPostByIdAction = CreateServerAction(
  false,
  async (postId: string) => {
    try {
      const post = await GetPostById(postId)
      if (post) {
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
