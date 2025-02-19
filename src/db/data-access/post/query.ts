import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { db } from "../.."
import {
  commentsTable,
  InsertComment,
  InsertPollOption,
  InsertPollVote,
  InsertPost,
  likesTable,
  pollOptionsTable,
  pollVotesTable,
  postsTable,
  hashtagsTable,
  postHashtagsTable,
  SelectHashtag,
  InsertFile,
  filesTable
} from "../../schema"
import { eq, and, desc } from "drizzle-orm"
import { like } from "drizzle-orm"
import { Tag } from "@/src/components/TagsInput/tags-input-types.d"

export const CreatePost = async (post: InsertPost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const CreateFilePost = async (post: InsertPost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const AddFile = async (file: InsertFile) => {
  return await db.insert(filesTable).values(file).returning()
}

export const AddPollOptions = async (options: InsertPollOption[]) => {
  return await db.insert(pollOptionsTable).values(options).returning()
}

export const LikePost = async (
  post_id: string,
  user_id: string,
  likes: number
) => {
  return await db.transaction(async (tx) => {
    // Insert into likes table
    await tx.insert(likesTable).values({ post_id, user_id }).returning()
    // Increment likes count in posts table
    const updatedPost = await tx
      .update(postsTable)
      .set({ likes: (likes || 0) + 1 })
      .where(eq(postsTable.id, post_id))
      .returning()

    return updatedPost[0]
  })
}

export const UnlikePost = async (
  post_id: string,
  user_id: string,
  likes: number
) => {
  return await db.transaction(async (tx) => {
    // Delete from likes table
    await tx
      .delete(likesTable)
      .where(
        and(eq(likesTable.post_id, post_id), eq(likesTable.user_id, user_id))
      )
    // Decrement likes count in posts table
    const updatedPost = await tx
      .update(postsTable)
      .set({ likes: Math.max((likes || 0) - 1, 0) })
      .where(eq(postsTable.id, post_id))
      .returning()

    return updatedPost[0]
  })
}

export const IsPostLiked = async (postId: string, userId: string) => {
  const like = await db.query.likesTable.findFirst({
    where: and(eq(likesTable.post_id, postId), eq(likesTable.user_id, userId))
  })
  return like !== undefined
}

export const CreateComment = async (
  comment: InsertComment,
  comments: number
) => {
  return await db.transaction(async (tx) => {
    // Insert the comment
    const newComment = await tx
      .insert(commentsTable)
      .values(comment)
      .returning()
    // Increment comments count in posts table
    await tx
      .update(postsTable)
      .set({ comments: (comments || 0) + 1 })
      .where(eq(postsTable.id, comment.post_id))
    return { ...newComment[0] }
  })
}

export const VotePoll = async (vote: InsertPollVote, voteCount: number) => {
  return await db.transaction(async (tx) => {
    // Insert vote record
    const newVote = await tx.insert(pollVotesTable).values(vote).returning()
    // Increment vote count for the selected option
    const updatedOption = await tx
      .update(pollOptionsTable)
      .set({ vote_count: (voteCount || 0) + 1 })
      .where(
        and(
          eq(pollOptionsTable.post_id, vote.post_id),
          eq(pollOptionsTable.option_text, vote.option_text)
        )
      )
      .returning()
    return {
      vote: newVote[0],
      option: updatedOption[0]
    }
  })
}

export const HasUserVoted = async (postId: string, userId: string) => {
  return await db.query.pollVotesTable.findFirst({
    where: and(
      eq(pollVotesTable.post_id, postId),
      eq(pollVotesTable.user_id, userId)
    )
  })
}

export const GetPublicPosts = async () => {
  try {
    const posts = await db.query.postsTable.findMany({
      where: eq(postsTable.is_private, 0),
      with: {
        author: true,
        postComments: {
          with: {
            commentor: true
          }
        },
        hashtags: {
          with: {
            hashtag: true
          }
        },
        options: true,
        file: true
      },
      orderBy: desc(postsTable.created_at)
    })
    return posts
  } catch (error: any) {
    throw new Error(error)
  }
}

export const CreateHashtags = async (names: string[]) => {
  const newHashtags = await db
    .insert(hashtagsTable)
    .values(
      names.map((name) => {
        return { name }
      })
    )
    .returning()
  return newHashtags
}

export const UpdateHashTagsCount = async (tags: Tag[]) => {
  const updatedHashtags = []
  for (const tag of tags) {
    const updatedHashtag = await db
      .update(hashtagsTable)
      .set({ count: (tag.count as number) + 1 })
      .where(eq(hashtagsTable.name, tag.name))
      .returning()
    updatedHashtags.push(updatedHashtag[0])
  }
  return updatedHashtags
}

export const AddHashtagToPostLink = async (
  hashtags: SelectHashtag[],
  postId: string
) => {
  await db.insert(postHashtagsTable).values(
    hashtags.map((tag) => {
      return { post_id: postId, hashtag_id: tag.id }
    })
  )
}

export const SearchHashtags = async (searchTerm: string) => {
  const hashtags = await db.query.hashtagsTable.findMany({
    where: like(hashtagsTable.name, `%${searchTerm}%`),
    orderBy: desc(hashtagsTable.count),
    limit: 10
  })
  return hashtags
}
