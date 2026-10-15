import { sql } from "drizzle-orm"
import { db } from "../../.."
import { CommunitiesReport } from "@/src/types/Reporting/Reporting.schema"
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

const scopedCommunityPostsCte = sql`
  community_posts as (
    select ch.community_id as community_id, p.id as post_id
    from channels ch
    inner join spaces sp on sp.channel_id = ch.channel_id
    inner join posts p on p.entity_id = sp.id and p.entity_type = 'space'
    where ch.community_id is not null
  )
`

export async function GetCommunitiesReportModule(): Promise<CommunitiesReport> {
  const [
    totalsRows,
    membershipRows,
    channelRows,
    channelUserRows,
    spaceRows,
    spaceUserRows,
    spacePostsRows,
    fileTypeRows,
    projectsRows,
    categoryRows,
    memberRankingRows,
    postRankingRows,
    communityStatRows
  ] = await Promise.all([
    db.execute(sql`
      select
        count(*) as total,
        count(*) filter (where type = 'public') as public,
        count(*) filter (where type <> 'public') as private
      from communities
    `),
    db.execute(sql`
      select count(*) as total, count(*) filter (where status = 'active') as active
      from community_users
    `),
    db.execute(sql`
      select count(*) as total, count(*) filter (where publish_channel = 1) as published
      from channels
      where community_id is not null
    `),
    db.execute(sql`
      select count(*) as total, count(*) filter (where cu.status = 'active') as active
      from channel_users cu
      inner join channels ch on ch.channel_id = cu.channel_id
      where ch.community_id is not null
    `),
    db.execute(sql`
      select count(*) as total, count(*) filter (where sp.publish_space = 1) as published
      from spaces sp
      inner join channels ch on ch.channel_id = sp.channel_id
      where ch.community_id is not null
    `),
    db.execute(sql`
      select count(*) as total, count(*) filter (where su.status = 'active') as active
      from space_users su
      inner join spaces sp on sp.id = su.space_id
      inner join channels ch on ch.channel_id = sp.channel_id
      where ch.community_id is not null
    `),
    db.execute(sql`
      with ${scopedCommunityPostsCte}
      select
        (select count(*) from community_posts) as total,
        (select count(*) from comments cm inner join community_posts cp on cp.post_id = cm.post_id) as comments,
        (select count(*) from likes lk inner join community_posts cp on cp.post_id = lk.post_id) as likes
    `),
    db.execute(sql`
      select f.file_type as type, count(*) as count
      from space_file_directory sfd
      inner join files f on f.id = sfd.entity_id
      inner join spaces sp on sp.id = sfd.space_id
      inner join channels ch on ch.channel_id = sp.channel_id
      where ch.community_id is not null
      group by f.file_type
    `),
    db.execute(sql`
      with scoped_spaces as (
        select sp.id as space_id
        from spaces sp
        inner join channels ch on ch.channel_id = sp.channel_id
        where ch.community_id is not null
      )
      select
        (select count(*) from project pr inner join scoped_spaces ss on ss.space_id = pr.space_id) as total,
        (select count(*) from task t inner join project pr on pr.id = t.project_id inner join scoped_spaces ss on ss.space_id = pr.space_id) as tasks_total
    `),
    db.execute(sql`
      select cc.name as category_name, count(c.id) as communities
      from community_categories cc
      left join communities c on c.category_id = cc.id
      group by cc.name
    `),
    db.execute(sql`
      select c.id as community_id, c.title, count(cu.id) as total_members
      from communities c
      left join community_users cu on cu.community_id = c.id
      group by c.id, c.title
      order by total_members desc
      limit ${RANKING_LIMIT}
    `),
    db.execute(sql`
      with ${scopedCommunityPostsCte}
      select c.id as community_id, c.title, count(cp.post_id) as total_posts
      from communities c
      left join community_posts cp on cp.community_id = c.id
      group by c.id, c.title
      order by total_posts desc
      limit ${RANKING_LIMIT}
    `),
    db.execute(sql`
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
  ])

  const totals = totalsRows[0] as unknown as RawCommunityTotalsRow
  const memberships = membershipRows[0] as unknown as RawCountActive
  const channels = channelRows[0] as unknown as RawCountPublished
  const channelUsers = channelUserRows[0] as unknown as RawCountActive
  const spaces = spaceRows[0] as unknown as RawCountPublished
  const spaceUsers = spaceUserRows[0] as unknown as RawCountActive
  const spacePosts = spacePostsRows[0] as unknown as RawSpacePostsStatsRow
  const projects = projectsRows[0] as unknown as RawProjectsStatsRow

  const fileTypes = fileTypeRows as unknown as RawFileTypeRow[]
  const filesTotal = fileTypes.reduce((sum, row) => sum + Number(row.count), 0)

  const categories: CommunitiesReport["categories"] = {}
  for (const row of categoryRows as unknown as RawCategoryRow[]) {
    categories[row.category_name] = { communities: Number(row.communities) }
  }

  return {
    total: Number(totals.total),
    public: Number(totals.public),
    private: Number(totals.private),
    memberships: {
      total: Number(memberships.total),
      active: Number(memberships.active),
      // Not computed in v1 — explicitly marked unused in the source contract.
      roles: {
        members: { total: null, active: null },
        admins: { total: null, active: null }
      }
    },
    channels: {
      total: Number(channels.total),
      published: Number(channels.published),
      users: {
        total: Number(channelUsers.total),
        active: Number(channelUsers.active)
      },
      spaces: {
        total: Number(spaces.total),
        published: Number(spaces.published),
        users: {
          total: Number(spaceUsers.total),
          active: Number(spaceUsers.active)
        },
        posts: {
          total: Number(spacePosts.total),
          comments: Number(spacePosts.comments),
          likes: Number(spacePosts.likes)
        },
        files: {
          total: filesTotal,
          types: fileTypes.map((row) => ({
            type: row.type,
            count: Number(row.count)
          }))
        },
        projects: {
          total: Number(projects.total),
          tasks: { total: Number(projects.tasks_total) }
        }
      }
    },
    categories,
    ranking: {
      by_members: (memberRankingRows as unknown as RawMemberRankingRow[]).map(
        (row) => ({
          community_id: row.community_id,
          title: row.title,
          total_members: Number(row.total_members)
        })
      ),
      by_posts: (postRankingRows as unknown as RawPostRankingRow[]).map(
        (row) => ({
          community_id: row.community_id,
          title: row.title,
          total_posts: Number(row.total_posts)
        })
      )
    },
    community_stats: (
      communityStatRows as unknown as RawCommunityStatRow[]
    ).map((row) => ({
      community_id: row.community_id,
      title: row.title,
      memberships: {
        total: Number(row.memberships_total),
        active: Number(row.memberships_active)
      },
      channels: {
        total: Number(row.channels_total),
        spaces: { total: Number(row.spaces_total) }
      },
      posts: {
        total: Number(row.posts_total),
        comments: Number(row.posts_comments),
        likes: Number(row.posts_likes)
      }
    }))
  }
}
