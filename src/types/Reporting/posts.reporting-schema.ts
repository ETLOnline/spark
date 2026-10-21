import { z } from "zod"
import { GroupCountEntrySchema } from "./utilities.reporting-schema"

export const HashtagTopEntrySchema = z.object({
  hashtag_id: z.number(),
  tag: z.string(),
  uses: z.number()
})

export const PostAuthorSchema = z.object({
  user_id: z.string(),
  user_name: z.string()
})

export const TopPostEntrySchema = z.object({
  post_id: z.string(),
  author: PostAuthorSchema,
  likes: z.number(),
  comments: z.number()
})

export const TopCreatorEntrySchema = z.object({
  user_id: z.string(),
  user_name: z.string(),
  email: z.string(),
  total_posts: z.number()
})

export const PostsReportSchema = z.object({
  total: z.number(),
  // Dynamic group-bys over plain varchar columns (posts.type / posts.category),
  // not a fixed enum. category=null posts are bucketed under "uncategorized".
  by_type: z.array(GroupCountEntrySchema),
  by_category: z.array(GroupCountEntrySchema),
  likes: z.object({ total: z.number() }),
  comments: z.object({ total: z.number() }),
  polls: z.object({
    total: z.number(),
    options: z.object({
      total: z.number(),
      votes: z.object({ total: z.number() })
    })
  }),
  hashtags: z.object({
    // Distinct hashtags actually used (post_hashtags), not all registered tags.
    total: z.number(),
    top: z.array(HashtagTopEntrySchema)
  }),
  ranking: z.object({
    top_posts: z.array(TopPostEntrySchema),
    top_creators: z.array(TopCreatorEntrySchema)
  })
})

export type PostsReport = z.infer<typeof PostsReportSchema>
