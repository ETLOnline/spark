"use server"

import {
  AddPollOptions,
  CreateFilePost,
  CreatePost,
  LikePost,
  UnlikePost,
  IsPostLiked,
  CreateComment,
  VotePoll,
  HasUserVoted,
  GetPublicPosts,
  SearchHashtags,
  AddFile,
  CreateHashtags,
  AddHashtagToPostLink,
  UpdateHashTagsCount
} from "@/src/db/data-access/post/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { TagStatus } from "@/src/components/TagsInput/tags-input-types.d"
import { uploadFileToBucket } from "@/src/utils/serverHelpers"

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
    fileSize: string,
    fileName: string,
    fileType: string,
    fileBase64: string
  ) => {
    let delFile: () => void = () => {
      return
    }
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const { url: signedUrl, delTempFile } = await uploadFileToBucket(
          fileName,
          fileBase64
        )
        delFile = delTempFile
        const postData = await CreateFilePost({
          type,
          user_id: userId
        })
        if (postData) {
          const fileData = await AddFile({
            file_name: fileName,
            file_size: fileSize,
            file_type: fileType,
            post_id: postData[0].id,
            file_path: signedUrl
          })
          return {
            success: true,
            data: { ...postData[0], file: { ...fileData[0] } }
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
    } finally {
      delFile()
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
        const pollOptions = options.map((option) => {
          return { option_text: option, post_id: postData[0].id }
        })
        const pollOptionsData = await AddPollOptions(pollOptions)
        const data = { ...postData[0], options: [...pollOptionsData] }
        return { success: true, data }
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

export const IsPostLikedAction = CreateServerAction(
  true,
  async (postId: string) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const isLiked = await IsPostLiked(postId, userId)
        return { success: true, data: isLiked }
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

export const HasUserVotedAction = CreateServerAction(
  true,
  async (postId: string) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const hasVoted = await HasUserVoted(postId, userId)
        return { success: true, data: hasVoted }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to check vote status"
      }
    }
  }
)

export const GetPublicPostsAction = CreateServerAction(true, async () => {
  try {
    const posts = await GetPublicPosts()
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
        await AddHashtagToPostLink(newHashtags, postId)
        const existingHashtags = await UpdateHashTagsCount(existingTags)
        await AddHashtagToPostLink(existingHashtags, postId)
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
