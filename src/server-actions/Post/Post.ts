"use server"

import {
  AddPollOptions,
  CreateFilePost,
  CreatePost,
  LikePost,
  UnlikePost,
  CreateComment,
  VotePoll,
  SearchHashtags,
  CreateHashtags,
  AddHashtagToPostLink,
  UpdateHashTagsCount,
  getPosts,
  DeletePost
} from "@/src/db/data-access/post/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { TagStatus } from "@/src/components/TagsInput/tags-input-types"
import { addFileToDb } from "@/src/utils/serverHelpers"

export const CreatePostAction = CreateServerAction(
  true,
  async (content: string, type: string) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const postData = await CreatePost({
          content,
          type,
          user_id: userId
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

export const CreateFilePostAction = CreateServerAction(
  true,
  async (
    type: string,
    fileSize: number,
    fileName: string,
    fileType: string,
    fileBase64: string,
    content?: string
  ) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const postData = await CreateFilePost({
          type,
          user_id: userId,
          content
        })
        if (postData) {
          if (process.env.S3_BUCKET_NAME) {
            const fileData = await addFileToDb(
              fileName,
              fileBase64,
              process.env.S3_BUCKET_NAME,
              postData[0].id,
              fileSize,
              fileType,
              "/posts"
            )
            return {
              success: true,
              data: { ...postData[0], file: { ...fileData[0] } }
            }
          } else {
            throw new Error("S3 Bucket name not found", {
              cause: 500
            })
          }
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

export const CreatePollPostAction = CreateServerAction(
  true,
  async (content: string, type: string, options: string[]) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const postData = await CreatePost({
          content,
          type,
          user_id: userId
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
  async (postId: string, isLiked: boolean, likes: number) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        if (isLiked) {
          const data = await UnlikePost(postId, userId, likes)
          return { success: true, data }
        } else {
          const data = await LikePost(postId, userId, likes)
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
  async (postId: string, content: string, comments: number) => {
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

export const GetPublicPostsAction = CreateServerAction(true, async () => {
  try {
    const posts = await getPosts()
    const sanitizedPosts = posts.map((post) => ({
      ...post,
      hashtags: post.hashtags.map((hashtag) => hashtag.hashtag)
    }))
    return { success: true, data: sanitizedPosts }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch user posts"
    }
  }
})

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
