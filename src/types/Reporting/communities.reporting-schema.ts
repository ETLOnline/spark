import { z } from "zod"

export const CategoryBlockSchema = z.object({
  communities: z.number()
})

export const MembershipRoleBlockSchema = z.object({
  total: z.number().nullable(),
  active: z.number().nullable()
})

/**
 * NOT COMPUTED in v1 — the source contract marks this section with a literal
 * "_comment: we are not using this section for now" key. The shape is kept
 * for forward compatibility (so a future version can fill it in without a
 * contract change), but every leaf is always null. The `_comment` string
 * itself is intentionally NOT part of the runtime schema — it has no place
 * in a real API response; this comment is where that explanation lives.
 */
export const MembershipRolesBlockSchema = z.object({
  members: MembershipRoleBlockSchema,
  admins: MembershipRoleBlockSchema
})

export const FileTypeBlockSchema = z.object({
  type: z.string(),
  count: z.number()
})

/**
 * Per-community details shown alongside each ranking row (visibility, admin,
 * FYP flag) and the slug used to link to the community page.
 *
 * Optional because snapshots are persisted and read back with a cast, not
 * re-parsed — a snapshot built before these fields existed won't have them
 * until the next rebuild, and the UI must render a placeholder in that case.
 */
export const CommunityRankingDetailsSchema = z.object({
  slug: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
  /** Display names of every community admin — creator first, then alphabetical; empty when none is assigned. */
  admin_names: z.array(z.string()).optional(),
  fyp_enabled: z.boolean().optional()
})

export const CommunityMemberRankingEntrySchema = z
  .object({
    community_id: z.string(),
    title: z.string(),
    total_members: z.number()
  })
  .merge(CommunityRankingDetailsSchema)

export const CommunityPostRankingEntrySchema = z
  .object({
    community_id: z.string(),
    title: z.string(),
    total_posts: z.number()
  })
  .merge(CommunityRankingDetailsSchema)

export const CommunityStatSchema = z.object({
  community_id: z.string(),
  title: z.string(),
  memberships: z.object({
    total: z.number(),
    active: z.number()
  }),
  channels: z.object({
    total: z.number(),
    spaces: z.object({
      total: z.number()
    })
  }),
  posts: z.object({
    total: z.number(),
    comments: z.number(),
    likes: z.number()
  })
})

export const CommunitiesReportSchema = z.object({
  total: z.number(),
  public: z.number(),
  private: z.number(),
  memberships: z.object({
    total: z.number(),
    active: z.number(),
    roles: MembershipRolesBlockSchema
  }),
  channels: z.object({
    total: z.number(),
    published: z.number(),
    users: z.object({
      total: z.number(),
      active: z.number()
    }),
    spaces: z.object({
      total: z.number(),
      published: z.number(),
      users: z.object({
        total: z.number(),
        active: z.number()
      }),
      posts: z.object({
        total: z.number(),
        comments: z.number(),
        likes: z.number()
      }),
      files: z.object({
        total: z.number(),
        types: z.array(FileTypeBlockSchema)
      }),
      projects: z.object({
        total: z.number(),
        tasks: z.object({
          total: z.number()
        })
      })
    })
  }),
  // Keyed dynamically by community_categories.name.
  categories: z.record(z.string(), CategoryBlockSchema),
  ranking: z.object({
    by_members: z.array(CommunityMemberRankingEntrySchema),
    by_posts: z.array(CommunityPostRankingEntrySchema)
  }),
  community_stats: z.array(CommunityStatSchema)
})

export type CommunitiesReport = z.infer<typeof CommunitiesReportSchema>
export type CommunityStat = z.infer<typeof CommunityStatSchema>
