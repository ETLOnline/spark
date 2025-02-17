import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { db } from "../.."
import {
  commentsTable,
  InsertComment,
  InsertFilePost,
  InsertPollOption,
  InsertPollVote,
  InsertPost,
  likesTable,
  pollOptionsTable,
  pollVotesTable,
  postsTable,
  hashtagsTable,
  postHashtagsTable,
  InsertHashtag,
  InsertPostHashtag,
  SelectHashtag
} from "../../schema"
import { eq, and, desc } from "drizzle-orm"
import { like } from "drizzle-orm"
import { Tag, TagStatus } from "@/src/components/TagsInput/tags-input.type.d"

export const CreatePost = async (post: InsertPost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const CreateFilePost = async (post: InsertFilePost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const AddPollOptions = async (options: InsertPollOption[]) => {
  return await db.insert(pollOptionsTable).values(options).returning()
}

export const LikePost = async (post_id: string, user_id: string) => {
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

export const UnlikePost = async (post_id: string, user_id: string) => {
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

export const IsPostLiked = async (postId: string, userId: string) => {
  const like = await db.query.likesTable.findFirst({
    where: and(eq(likesTable.post_id, postId), eq(likesTable.user_id, userId))
  })
  return like !== undefined
}

export const CreateComment = async (comment: InsertComment) => {
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

export const VotePoll = async (vote: InsertPollVote) => {
  return await db.transaction(async (tx) => {
    // Insert vote record
    const newVote = await tx.insert(pollVotesTable).values(vote).returning()
    // Increment vote count for the selected option
    const option = await tx.query.pollOptionsTable.findFirst({
      where: and(
        eq(pollOptionsTable.post_id, vote.post_id),
        eq(pollOptionsTable.option_text, vote.option_text)
      )
    })
    const updatedOption = await tx
      .update(pollOptionsTable)
      .set({ vote_count: (option?.vote_count || 0) + 1 })
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

export const GetUserPosts = async (userId: string) => {
  try {
    const posts = await db.query.postsTable.findMany({
      where: eq(postsTable.user_id, userId),
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
        pollOptions: true
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

export const updateHashTagsCount = async (tags: Tag[]) => {
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

export const LinkNewHashtagsToPost = async (
  postId: string,
  hashtags: string[]
) => {
  return await db.transaction(async (tx) => {
    const linkedHashtags = await CreateHashtags(hashtags)
    await AddHashtagToPostLink(linkedHashtags, postId)
    return linkedHashtags
  })
}

export const LinkExistingHashtagsToPost = async (
  postId: string,
  hashtags: Tag[]
) => {
  return await db.transaction(async (tx) => {
    const linkedHashtags = await updateHashTagsCount(hashtags)
    await AddHashtagToPostLink(linkedHashtags, postId)
    return linkedHashtags
  })
}

export const SearchHashtags = async (searchTerm: string) => {
  try {
    const hashtags = await db.query.hashtagsTable.findMany({
      where: like(hashtagsTable.name, `%${searchTerm}%`),
      orderBy: desc(hashtagsTable.count),
      limit: 10
    })
    return hashtags
  } catch (error: any) {
    throw new Error(`Failed to search hashtags: ${error.message}`)
  }
}
