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
  tagsTable,
  postHashtagsTable,
  SelectTag,
  postFilesTable,
  spacesTable,
  channelsTable
} from "../../schema"
import { eq, and, desc, inArray, or, isNull, SQL } from "drizzle-orm"
import { like } from "drizzle-orm"
import { Tag } from "@/src/components/TagsInput/tags-input-types"

interface PostQueryFilters {
  isPrivate?: boolean
  entityId?: string
  userIds?: string[]
  limit?: number
  offset?: number
  orderBy?: "created_at" | "likes" | "comments"
  orderDirection?: "asc" | "desc"
  category?: string
}

export const CreatePost = async (post: InsertPost) => {
  return await db.insert(postsTable).values(post).returning()
}

export const AddPostFileLink = async (postId: string, fileId: number) => {
  return await db
    .insert(postFilesTable)
    .values({ post_id: postId, file_id: fileId })
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

export const GetPosts = async (filters: PostQueryFilters = {}) => {
  try {
    const {
      userIds = [],
      limit = 10,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
      entityId = "",
      category = ""
    } = filters
    const whereClauses = [
      ...(userIds.length ? [inArray(postsTable.user_id, userIds)] : []),
      ...(category ? [eq(postsTable.category, category)] : [])
    ]

    if (entityId) {
      whereClauses.push(eq(postsTable.entity_id, entityId))
    } else {
      // If entity_id is not provided, get public space ids.
      const publicSpaces = await db
        .select({ id: spacesTable.id })
        .from(spacesTable)
        .innerJoin(channelsTable, eq(spacesTable.channel_id, channelsTable.id))
        .where(eq(channelsTable.channel_type, "public"))
      const publicSpaceIds = publicSpaces.map((space) => space.id)

      // Fetch posts that either have a NULL entity_id or whose entity_id is in the publicSpaces list
      whereClauses.push(
        or(
          isNull(postsTable.entity_id),
          inArray(postsTable.entity_id, publicSpaceIds)
        ) as SQL<unknown>
      )
    }

    return await db.query.postsTable.findMany({
      limit,
      offset,
      where: whereClauses.length ? and(...whereClauses) : undefined,
      with: {
        author: true,
        postComments: { with: { commentor: true }, limit:5, orderBy: [desc(commentsTable.created_at)] },
        hashtags: { with: { hashtag: true } },
        options: { with: { votes: true } },
        file: { with: { postFile: true } },
        postLikes: true
      },
      orderBy:
        orderDirection === "desc"
          ? [desc(postsTable[orderBy])]
          : [postsTable[orderBy]]
    })
  } catch (error: any) {
    throw new Error(error)
  }
}

export const CreateHashtags = async (names: string[]) => {
  const newHashtags = await db
    .insert(tagsTable)
    .values(
      names.map((name) => {
        return { name, type: "hashtag" }
      })
    )
    .returning()
  return newHashtags
}

export const UpdateHashTagsCount = async (tags: Tag[]) => {
  const updatedHashtags = []
  for (const tag of tags) {
    const updatedHashtag = await db
      .update(tagsTable)
      .set({ count: (tag.count as number) + 1 })
      .where(eq(tagsTable.name, tag.name))
      .returning()
    updatedHashtags.push(updatedHashtag[0])
  }
  return updatedHashtags
}

export const AddHashtagToPostLink = async (
  hashtags: SelectTag[],
  postId: string
) => {
  await db.insert(postHashtagsTable).values(
    hashtags.map((tag) => {
      return { post_id: postId, hashtag_id: tag.id }
    })
  )
}

export const SearchHashtags = async (searchTerm: string) => {
  const hashtags = await db.query.tagsTable.findMany({
    where: and(
      eq(tagsTable.type, "hashtag"),
      like(tagsTable.name, `%${searchTerm}%`)
    ),
    orderBy: desc(tagsTable.count),
    limit: 10
  })
  return hashtags
}

export const DeletePost = async (postId: string) => {
  return await db.transaction(async (tx) => {
    // Delete associated records first
    await tx.delete(likesTable).where(eq(likesTable.post_id, postId))
    await tx.delete(commentsTable).where(eq(commentsTable.post_id, postId))
    await tx
      .delete(pollOptionsTable)
      .where(eq(pollOptionsTable.post_id, postId))
    await tx.delete(pollVotesTable).where(eq(pollVotesTable.post_id, postId))
    await tx
      .delete(postHashtagsTable)
      .where(eq(postHashtagsTable.post_id, postId))
    await tx.delete(postFilesTable).where(eq(postFilesTable.post_id, postId))

    // Finally delete the post
    const deletedPost = await tx
      .delete(postsTable)
      .where(eq(postsTable.id, postId))
      .returning()

    return deletedPost[0]
  })
}
