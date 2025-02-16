import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { db } from "../.."
import {
  commentsTable,
  InsertComment,
  InsertFilePost,
  InsertPollOption,
  InsertPost,
  likesTable,
  pollOptionsTable,
  postsTable
} from "../../schema"
import { eq, and } from "drizzle-orm"

export const createPost = async (post: InsertPost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const createFilePost = async (post: InsertFilePost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const addPollOptions = async (options: InsertPollOption[]) => {
  return await db.insert(pollOptionsTable).values(options).returning()
}

export const likePost = async (post_id: number, user_id: string) => {
  return await db.transaction(async (tx) => {
    // Insert into likes table
    const like = await tx
      .insert(likesTable)
      .values({ post_id, user_id })
      .returning()
    // Increment likes count in posts table
    const post = await tx.query.postsTable.findFirst({
      where: eq(postsTable.id, post_id)
    })
    const updatedPost = await tx
      .update(postsTable)
      .set({ likes: (post?.likes || 0) + 1 })
      .where(eq(postsTable.id, post_id))
      .returning()

    return updatedPost[0]
  })
}

export const unlikePost = async (post_id: number, user_id: string) => {
  return await db.transaction(async (tx) => {
    // Delete from likes table
    await tx
      .delete(likesTable)
      .where(
        and(eq(likesTable.post_id, post_id), eq(likesTable.user_id, user_id))
      )
    // Decrement likes count in posts table
    const post = await tx.query.postsTable.findFirst({
      where: eq(postsTable.id, post_id)
    })
    const updatedPost = await tx
      .update(postsTable)
      .set({ likes: Math.max((post?.likes || 0) - 1, 0) })
      .where(eq(postsTable.id, post_id))
      .returning()

    return updatedPost[0]
  })
}

export const isPostLiked = async (postId: number, userId: string) => {
  const like = await db.query.likesTable.findFirst({
    where: and(eq(likesTable.post_id, postId), eq(likesTable.user_id, userId))
  })
  return like !== undefined
}

export const createComment = async (comment: InsertComment) => {
  return await db.transaction(async (tx) => {
    const user = AuthUserAction()
    // Insert the comment
    const newComment = await tx
      .insert(commentsTable)
      .values(comment)
      .returning()
    // Increment comments count in posts table
    const post = await tx.query.postsTable.findFirst({
      where: eq(postsTable.id, comment.post_id)
    })
    await tx
      .update(postsTable)
      .set({ comments: (post?.likes || 0) + 1 })
      .where(eq(postsTable.id, comment.post_id))
    return { ...newComment[0] }
  })
}
