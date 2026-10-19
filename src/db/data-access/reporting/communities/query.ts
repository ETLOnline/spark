import { sql } from "drizzle-orm"
import { db } from "../../.."
import {
  RawCommunityTotalsRow,
  RawCountActive,
  RawCountPublished,
  RawSpacePostsStatsRow,
  RawFileTypeRow,
  RawProjectsStatsRow,
  RawCategoryRow,
  RawMemberRankingRow,
  RawPostRankingRow,
  RawCommunityStatRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"

/**
 * Posts/comments/likes have no direct community_id — they only reach a
 * community via posts.entity_id -> spaces.id -> spaces.channel_id ->
 * channels.id -> channels.community_id. This CTE is the shared join chain
 * used by every post-related query below. channels.community_id is nullable
 * (a channel can be un-scoped), so those are excluded throughout.
 */
const scopedCommunityPostsCte = sql`
  community_posts as (
    select ch.community_id as community_id, p.id as post_id
    from channels ch
    inner join spaces sp on sp.channel_id = ch.channel_id
    inner join posts p on p.entity_id = sp.id and p.entity_type = 'space'
    where ch.community_id is not null
  )
`

export async function GetCommunityTotalsRaw(): Promise<RawCommunityTotalsRow> {
  const rows = await db.execute(sql`
    select
      count(*) as total,
      count(*) filter (where type = 'public') as public,
      count(*) filter (where type <> 'public') as private
    from communities
  `)
  return rows[0] as unknown as RawCommunityTotalsRow
}

export async function GetCommunityMembershipTotalsRaw(): Promise<RawCountActive> {
  const rows = await db.execute(sql`
    select count(*) as total, count(*) filter (where status = 'active') as active
    from community_users
  `)
  return rows[0] as unknown as RawCountActive
}

export async function GetCommunityChannelTotalsRaw(): Promise<RawCountPublished> {
  const rows = await db.execute(sql`
    select count(*) as total, count(*) filter (where publish_channel = 1) as published
    from channels
    where community_id is not null
  `)
  return rows[0] as unknown as RawCountPublished
}

export async function GetCommunityChannelUserTotalsRaw(): Promise<RawCountActive> {
  const rows = await db.execute(sql`
    select count(*) as total, count(*) filter (where cu.status = 'active') as active
    from channel_users cu
    inner join channels ch on ch.channel_id = cu.channel_id
    where ch.community_id is not null
  `)
  return rows[0] as unknown as RawCountActive
}

export async function GetCommunitySpaceTotalsRaw(): Promise<RawCountPublished> {
  const rows = await db.execute(sql`
    select count(*) as total, count(*) filter (where sp.publish_space = 1) as published
    from spaces sp
    inner join channels ch on ch.channel_id = sp.channel_id
    where ch.community_id is not null
  `)
  return rows[0] as unknown as RawCountPublished
}

export async function GetCommunitySpaceUserTotalsRaw(): Promise<RawCountActive> {
  const rows = await db.execute(sql`
    select count(*) as total, count(*) filter (where su.status = 'active') as active
    from space_users su
    inner join spaces sp on sp.id = su.space_id
    inner join channels ch on ch.channel_id = sp.channel_id
    where ch.community_id is not null
  `)
  return rows[0] as unknown as RawCountActive
}

export async function GetCommunitySpacePostsStatsRaw(): Promise<RawSpacePostsStatsRow> {
  const rows = await db.execute(sql`
    with ${scopedCommunityPostsCte}
    select
      (select count(*) from community_posts) as total,
      (select count(*) from comments cm inner join community_posts cp on cp.post_id = cm.post_id) as comments,
      (select count(*) from likes lk inner join community_posts cp on cp.post_id = lk.post_id) as likes
  `)
  return rows[0] as unknown as RawSpacePostsStatsRow
}

export async function GetCommunityFileTypesRaw(): Promise<RawFileTypeRow[]> {
  const rows = await db.execute(sql`
    select f.file_type as type, count(*) as count
    from space_file_directory sfd
    inner join files f on f.id = sfd.entity_id
    inner join spaces sp on sp.id = sfd.space_id
    inner join channels ch on ch.channel_id = sp.channel_id
    where ch.community_id is not null
    group by f.file_type
  `)
  return rows as unknown as RawFileTypeRow[]
}

export async function GetCommunityProjectsStatsRaw(): Promise<RawProjectsStatsRow> {
  const rows = await db.execute(sql`
    with scoped_spaces as (
      select sp.id as space_id
      from spaces sp
      inner join channels ch on ch.channel_id = sp.channel_id
      where ch.community_id is not null
    )
    select
      (select count(*) from project pr inner join scoped_spaces ss on ss.space_id = pr.space_id) as total,
      (select count(*) from task t inner join project pr on pr.id = t.project_id inner join scoped_spaces ss on ss.space_id = pr.space_id) as tasks_total
  `)
  return rows[0] as unknown as RawProjectsStatsRow
}

export async function GetCommunityCategoriesRaw(): Promise<RawCategoryRow[]> {
  const rows = await db.execute(sql`
    select cc.name as category_name, count(c.id) as communities
    from community_categories cc
    left join communities c on c.category_id = cc.id
    group by cc.name
  `)
  return rows as unknown as RawCategoryRow[]
}

export async function GetCommunityMemberRankingRaw(): Promise<
  RawMemberRankingRow[]
> {
  const rows = await db.execute(sql`
    select c.id as community_id, c.title, count(cu.id) as total_members
    from communities c
    left join community_users cu on cu.community_id = c.id
    group by c.id, c.title
    order by total_members desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawMemberRankingRow[]
}

export async function GetCommunityPostRankingRaw(): Promise<
  RawPostRankingRow[]
> {
  const rows = await db.execute(sql`
    with ${scopedCommunityPostsCte}
    select c.id as community_id, c.title, count(cp.post_id) as total_posts
    from communities c
    left join community_posts cp on cp.community_id = c.id
    group by c.id, c.title
    order by total_posts desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawPostRankingRow[]
}

export async function GetCommunityStatsRaw(): Promise<RawCommunityStatRow[]> {
  const rows = await db.execute(sql`
    with ${scopedCommunityPostsCte},
    membership_totals as (
      select community_id, count(*) as total, count(*) filter (where status = 'active') as active
      from community_users group by community_id
    ),
    channel_totals as (
      select community_id, count(*) as total from channels where community_id is not null group by community_id
    ),
    space_totals as (
      select ch.community_id, count(*) as total
      from spaces sp inner join channels ch on ch.channel_id = sp.channel_id
      where ch.community_id is not null
      group by ch.community_id
    ),
    post_totals as (
      select community_id, count(*) as total from community_posts group by community_id
    ),
    comment_totals as (
      select cp.community_id, count(*) as total
      from community_posts cp inner join comments cm on cm.post_id = cp.post_id
      group by cp.community_id
    ),
    like_totals as (
      select cp.community_id, count(*) as total
      from community_posts cp inner join likes lk on lk.post_id = cp.post_id
      group by cp.community_id
    )
    select
      c.id as community_id,
      c.title,
      coalesce(mt.total, 0) as memberships_total,
      coalesce(mt.active, 0) as memberships_active,
      coalesce(cht.total, 0) as channels_total,
      coalesce(st.total, 0) as spaces_total,
      coalesce(pt.total, 0) as posts_total,
      coalesce(cot.total, 0) as posts_comments,
      coalesce(lt.total, 0) as posts_likes
    from communities c
    left join membership_totals mt on mt.community_id = c.id
    left join channel_totals cht on cht.community_id = c.id
    left join space_totals st on st.community_id = c.id
    left join post_totals pt on pt.community_id = c.id
    left join comment_totals cot on cot.community_id = c.id
    left join like_totals lt on lt.community_id = c.id
    order by c.title asc
  `)
  return rows as unknown as RawCommunityStatRow[]
}
