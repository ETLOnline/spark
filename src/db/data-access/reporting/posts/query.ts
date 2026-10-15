import { sql } from "drizzle-orm"
import { db } from "../../.."
import { PostsReport } from "@/src/types/Reporting/Reporting.schema"
import {
  RawGroupCountRow,
  RawTotal,
  RawHashtagTopRow,
  RawTopPostRow,
  RawTopCreatorRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"
import { FormatUserName } from "@/src/utils/helpers"

export async function GetPostsReportModule(): Promise<PostsReport> {
  const [
    totalRows,
    byTypeRows,
    byCategoryRows,
    likesRows,
    commentsRows,
    pollsRows,
    pollOptionsRows,
    pollVotesRows,
    hashtagsTotalRows,
    hashtagsTopRows,
    topPostsRows,
    topCreatorsRows
  ] = await Promise.all([
    db.execute(sql`select count(*) as total from posts`),
    db.execute(sql`
      select type as value, count(*) as count from posts group by type
    `),
    // category is nullable — uncategorized posts are kept visible under an
    // explicit bucket rather than silently dropped.
    db.execute(sql`
      select coalesce(category, 'uncategorized') as value, count(*) as count
      from posts
      group by coalesce(category, 'uncategorized')
    `),
    db.execute(sql`select count(*) as total from likes`),
    db.execute(sql`select count(*) as total from comments`),
    db.execute(sql`select count(*) as total from posts where type = 'poll'`),
    db.execute(sql`select count(*) as total from poll_options`),
    db.execute(sql`select count(*) as total from poll_votes`),
    // Distinct hashtags actually used, not every row ever registered in `tags`.
    db.execute(sql`
      select count(distinct hashtag_id) as total from post_hashtags
    `),
    db.execute(sql`
      select t.id as hashtag_id, t.name as tag, count(*) as uses
      from post_hashtags ph
      inner join tags t on t.id = ph.hashtag_id
      group by t.id, t.name
      order by uses desc
      limit ${RANKING_LIMIT}
    `),
    db.execute(sql`
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
    `),
    db.execute(sql`
      select p.user_id, u.first_name, u.last_name, u.email, count(*) as total_posts
      from posts p
      inner join users u on u.unique_id = p.user_id
      group by p.user_id, u.first_name, u.last_name, u.email
      order by total_posts desc
      limit ${RANKING_LIMIT}
    `)
  ])

  return {
    total: Number((totalRows[0] as unknown as RawTotal).total),
    by_type: (byTypeRows as unknown as RawGroupCountRow[]).map((row) => ({
      value: row.value,
      count: Number(row.count)
    })),
    by_category: (byCategoryRows as unknown as RawGroupCountRow[]).map(
      (row) => ({
        value: row.value,
        count: Number(row.count)
      })
    ),
    likes: { total: Number((likesRows[0] as unknown as RawTotal).total) },
    comments: {
      total: Number((commentsRows[0] as unknown as RawTotal).total)
    },
    polls: {
      total: Number((pollsRows[0] as unknown as RawTotal).total),
      options: {
        total: Number((pollOptionsRows[0] as unknown as RawTotal).total),
        votes: {
          total: Number((pollVotesRows[0] as unknown as RawTotal).total)
        }
      }
    },
    hashtags: {
      total: Number((hashtagsTotalRows[0] as unknown as RawTotal).total),
      top: (hashtagsTopRows as unknown as RawHashtagTopRow[]).map((row) => ({
        hashtag_id: Number(row.hashtag_id),
        tag: row.tag,
        uses: Number(row.uses)
      }))
    },
    ranking: {
      top_posts: (topPostsRows as unknown as RawTopPostRow[]).map((row) => ({
        post_id: row.post_id,
        author: {
          user_id: row.user_id,
          user_name: FormatUserName(row.first_name, row.last_name)
        },
        likes: Number(row.likes_total),
        comments: Number(row.comments_total)
      })),
      top_creators: (topCreatorsRows as unknown as RawTopCreatorRow[]).map(
        (row) => ({
          user_id: row.user_id,
          user_name: FormatUserName(row.first_name, row.last_name),
          email: row.email,
          total_posts: Number(row.total_posts)
        })
      )
    }
  }
}
