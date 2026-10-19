import { sql } from "drizzle-orm"
import { db } from "../../.."
import {
  RawGroupCountRow,
  RawTotal,
  RawHashtagTopRow,
  RawTopPostRow,
  RawTopCreatorRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"

export async function GetPostTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`select count(*) as total from posts`)
  return rows[0] as unknown as RawTotal
}

/** Dynamic group-by over the plain varchar posts.type column, not a fixed enum. */
export async function GetPostsByTypeRaw(): Promise<RawGroupCountRow[]> {
  const rows = await db.execute(sql`
    select type as value, count(*) as count from posts group by type
  `)
  return rows as unknown as RawGroupCountRow[]
}

/** category is nullable — uncategorized posts are kept visible under an explicit bucket rather than silently dropped. */
export async function GetPostsByCategoryRaw(): Promise<RawGroupCountRow[]> {
  const rows = await db.execute(sql`
    select coalesce(category, 'uncategorized') as value, count(*) as count
    from posts
    group by coalesce(category, 'uncategorized')
  `)
  return rows as unknown as RawGroupCountRow[]
}

export async function GetLikesTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`select count(*) as total from likes`)
  return rows[0] as unknown as RawTotal
}

export async function GetCommentsTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`select count(*) as total from comments`)
  return rows[0] as unknown as RawTotal
}

export async function GetPollsTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`
    select count(*) as total from posts where type = 'poll'
  `)
  return rows[0] as unknown as RawTotal
}

export async function GetPollOptionsTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`
    select count(*) as total from poll_options
  `)
  return rows[0] as unknown as RawTotal
}

export async function GetPollVotesTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`select count(*) as total from poll_votes`)
  return rows[0] as unknown as RawTotal
}

/** Distinct hashtags actually used, not every row ever registered in `tags`. */
export async function GetHashtagsTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`
    select count(distinct hashtag_id) as total from post_hashtags
  `)
  return rows[0] as unknown as RawTotal
}

export async function GetHashtagsTopRaw(): Promise<RawHashtagTopRow[]> {
  const rows = await db.execute(sql`
    select t.id as hashtag_id, t.name as tag, count(*) as uses
    from post_hashtags ph
    inner join tags t on t.id = ph.hashtag_id
    group by t.id, t.name
    order by uses desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawHashtagTopRow[]
}

export async function GetTopPostsRaw(): Promise<RawTopPostRow[]> {
  const rows = await db.execute(sql`
    select
      p.id as post_id,
      p.user_id,
      u.first_name,
      u.last_name,
      coalesce(l.total, 0) as likes_total,
      coalesce(c.total, 0) as comments_total
    from posts p
    inner join users u on u.unique_id = p.user_id
    left join lateral (
      select count(*) as total from likes lk where lk.post_id = p.id
    ) l on true
    left join lateral (
      select count(*) as total from comments cm where cm.post_id = p.id
    ) c on true
    order by (coalesce(l.total, 0) + coalesce(c.total, 0)) desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawTopPostRow[]
}

export async function GetTopCreatorsRaw(): Promise<RawTopCreatorRow[]> {
  const rows = await db.execute(sql`
    select p.user_id, u.first_name, u.last_name, u.email, count(*) as total_posts
    from posts p
    inner join users u on u.unique_id = p.user_id
    group by p.user_id, u.first_name, u.last_name, u.email
    order by total_posts desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawTopCreatorRow[]
}
