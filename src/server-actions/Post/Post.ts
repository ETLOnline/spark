"use server"

import {
  addPollOptions,
  createFilePost,
  createPost,
  likePost,
  unlikePost,
  isPostLiked
} from "@/src/db/data-access/post/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { InsertPollOption } from "@/src/db/schema"

export const createPostAction = CreateServerAction(
  true,
  async (content: string, type: string) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const postData = await createPost({
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

export const createFilePostAction = CreateServerAction(
  true,
  async (content: string, type: string, fileSize: string, fileName: string) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const postData = await createFilePost({
          content,
          type,
          user_id: userId,
          fileName,
          fileSize
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

export const createPollPostAction = CreateServerAction(
  true,
  async (content: string, type: string, options: string[]) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const postData = await createPost({
          content,
          type,
          user_id: userId
        })
        const pollOptions = options.map((option) => {
          return { option_text: option, post_id: postData[0].id }
        })
        const pollOptionsData = await addPollOptions(pollOptions)
        const data = { ...postData[0], options: [...pollOptionsData] }
        return { success: true, data }
      }
    } catch (error: any) {
      return { success: false, error }
    }
  }
)

export const toggleLikeAction = CreateServerAction(
  true,
  async (postId: number, isLiked: boolean) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        if (isLiked) {
          const data = await unlikePost(postId, userId)
          return { success: true, data }
        } else {
          const data = await likePost(postId, userId)
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

export const isPostLikedAction = CreateServerAction(
  true,
  async (postId: number) => {
    try {
      const userId = (await AuthUserAction())?.unique_id
      if (userId) {
        const isLiked = await isPostLiked(postId, userId)
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
