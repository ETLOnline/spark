import { sql } from "drizzle-orm"
import { db } from "../.."
import { communityAdminLateral } from "../reporting/communities/query"
import { PaginationType } from "@/src/components/common/types/pagination.type"

export interface AdminCommunityListFilters {
  searchTerm?: string
  page?: number
  limit?: number
}

export interface AdminCommunityListItem {
  id: string
  title: string
  slug: string
  visibility: "public" | "private"
  category: string | null
  fyp_enabled: boolean
  total_members: number
  admin_names: string[]
  created_at: string | null
}

interface RawAdminCommunityRow {
  id: string
  title: string
  slug: string
  type: string
  category: string | null
  fyp_enabled: boolean | null
  total_members: string | number
  admin_names: string[] | null
  created_at: string | Date | null
  total_count: string | number
}

/** Escape LIKE wildcards so a search for "100%" matches literally. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&")

/**
 * Every community on the platform, newest first, for the Super Admin
 * communities list. Unlike the analytics snapshot this reads live data, so
 * edits and deletions show up immediately.
 */
export async function GetAdminCommunitiesList({
  searchTerm,
  page = 1,
  limit = 10
}: AdminCommunityListFilters): Promise<{
  communities: AdminCommunityListItem[]
  pagination: PaginationType
}> {
  const safePage = Math.max(1, Math.floor(page))
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)))
  const offset = (safePage - 1) * safeLimit

  const term = searchTerm?.trim()
  const pattern = term ? `%${escapeLike(term)}%` : null
  const searchClause = pattern
    ? sql`where (c.title ilike ${pattern} or c.slug ilike ${pattern})`
    : sql``

  const rows = (await db.execute(sql`
    select
      c.id,
      c.title,
      c.slug,
      c.type,
      cc.name as category,
      c."is_FYP_enable" as fyp_enabled,
      c.created_at,
      (select count(*) from community_users cu where cu.community_id = c.id) as total_members,
      adm.admin_names,
      count(*) over () as total_count
    from communities c
    left join community_categories cc on cc.id = c.category_id
    ${communityAdminLateral}
    ${searchClause}
    order by c.created_at desc nulls last, c.title asc
    limit ${safeLimit}
    offset ${offset}
  `)) as unknown as RawAdminCommunityRow[]

  // count(*) over () is missing when the page is past the end; fall back to a plain count.
  let total = rows.length > 0 ? Number(rows[0].total_count) : 0
  if (rows.length === 0 && safePage > 1) {
    const countRows = (await db.execute(sql`
      select count(*) as total from communities c ${searchClause}
    `)) as unknown as { total: string | number }[]
    total = Number(countRows[0]?.total ?? 0)
  }

  return {
    communities: rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      visibility: r.type === "public" ? "public" : "private",
      category: r.category,
      fyp_enabled: !!r.fyp_enabled,
      total_members: Number(r.total_members),
      admin_names: r.admin_names ?? [],
      created_at: r.created_at ? new Date(r.created_at).toISOString() : null
    })),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    }
  }
}
