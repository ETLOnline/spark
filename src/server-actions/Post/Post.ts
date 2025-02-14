"use server"

import {
  addPollOptions,
  createFilePost,
  createPost
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
