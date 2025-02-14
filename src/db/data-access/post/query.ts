import { db } from "../.."
import {
  InsertFilePost,
  InsertPollOption,
  InsertPost,
  pollOptionsTable,
  postsTable
} from "../../schema"

export const createPost = async (post: InsertPost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const createFilePost = async (post: InsertFilePost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const addPollOptions = async (options: InsertPollOption[]) => {
  return await db.insert(pollOptionsTable).values(options).returning()
}
