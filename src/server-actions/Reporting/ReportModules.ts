"use server"

import { CreateServerAction } from ".."
import {
  GetUserTotalsRaw,
  GetUserRoleBreakdownRaw
} from "@/src/db/data-access/reporting/users/query"
import {
  GetCommunityTotalsRaw,
  GetCommunityMembershipTotalsRaw,
  GetCommunityChannelTotalsRaw,
  GetCommunityChannelUserTotalsRaw,
  GetCommunitySpaceTotalsRaw,
  GetCommunitySpaceUserTotalsRaw,
  GetCommunitySpacePostsStatsRaw,
  GetCommunityFileTypesRaw,
  GetCommunityProjectsStatsRaw,
  GetCommunityCategoriesRaw,
  GetCommunityMemberRankingRaw,
  GetCommunityPostRankingRaw,
  GetCommunityStatsRaw
} from "@/src/db/data-access/reporting/communities/query"
import {
  GetMentorTotalsRaw,
  GetMentorAvailabilityTotalsRaw,
  GetMentorSessionTotalsRaw,
  GetMentorFeedbackTotalsRaw,
  GetMentorRankingRaw
} from "@/src/db/data-access/reporting/mentorship/query"
import {
  GetPostTotalRaw,
  GetPostsByTypeRaw,
  GetPostsByCategoryRaw,
  GetLikesTotalRaw,
  GetCommentsTotalRaw,
  GetPollsTotalRaw,
  GetPollOptionsTotalRaw,
  GetPollVotesTotalRaw,
  GetHashtagsTotalRaw,
  GetHashtagsTopRaw,
  GetTopPostsRaw,
  GetTopCreatorsRaw
} from "@/src/db/data-access/reporting/posts/query"
import {
  GetRewardIdsByInternalName,
  GetLedgerTotalRaw,
  GetRewardBalanceTotalRaw,
  GetRewardActionsTotalRaw,
  GetRewardRulesRaw,
  GetRewardRankingRaw
} from "@/src/db/data-access/reporting/rewards/query"
import { RewardTypes } from "@/src/types/Rewards/rewards"
import {
  GetEventTypeStatsRaw,
  GetEventRegistrationsTotalRaw,
  GetEventHostsTotalRaw,
  GetEventHostRankingRaw,
  GetEventTagsTotalRaw,
  GetEventTagRankingRaw
} from "@/src/db/data-access/reporting/events/query"
import {
  UsersReport,
  CommunitiesReport,
  MentorshipReport,
  PostsReport,
  RewardsReport,
  RewardTypeBlock,
  EventsReport
} from "@/src/types/Reporting/Reporting.schema"
import { FormatUserName } from "@/src/utils/helpers"

/**
 * One server action per report module. Only ever called from
 * BuildAdminReportSnapshot (internal orchestration), not from the client —
 * auth is disabled (false) to match, same as GenerateReportSnapshotAction,
 * since there's no Clerk session in that cron-triggered call path.
 *
 * Each action calls one or more *Raw data-access functions (query only, no
 * shaping) and does all the business logic itself — Number() casts, null
 * fallbacks, assembling the final contract shape. This matches the existing
 * Fyp precedent (GetFypDashboardStatsAction does its own mapping), not a new
 * pattern invented for this feature.
 */

// ─── Users ───────────────────────────────────────────────────────────────────

export const GetUsersReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const [totals, roleRows] = await Promise.all([
        GetUserTotalsRaw(),
        GetUserRoleBreakdownRaw()
      ])

      // users.active/inactive/online (and the per-role equivalents) are
      // always null — no status/activity/presence column exists on `users`.
      const roles: UsersReport["roles"] = {}
      for (const row of roleRows) {
        roles[row.role_name] = {
          total: Number(row.total),
          active: null,
          verified: Number(row.verified),
          completed_profiles: Number(row.completed_profiles),
          online: null
        }
      }

      const data: UsersReport = {
        total: Number(totals.total),
        active: null,
        inactive: null,
        verified: Number(totals.verified),
        completed_profiles: Number(totals.completed_profiles),
        online: null,
        roles
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error building users report module:", error)
      return { success: false, error }
    }
  }
)

// ─── Communities ─────────────────────────────────────────────────────────────

export const GetCommunitiesReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const [
        totals,
        memberships,
        channels,
        channelUsers,
        spaces,
        spaceUsers,
        spacePosts,
        fileTypes,
        projects,
        categoryRows,
        memberRankingRows,
        postRankingRows,
        communityStatRows
      ] = await Promise.all([
        GetCommunityTotalsRaw(),
        GetCommunityMembershipTotalsRaw(),
        GetCommunityChannelTotalsRaw(),
        GetCommunityChannelUserTotalsRaw(),
        GetCommunitySpaceTotalsRaw(),
        GetCommunitySpaceUserTotalsRaw(),
        GetCommunitySpacePostsStatsRaw(),
        GetCommunityFileTypesRaw(),
        GetCommunityProjectsStatsRaw(),
        GetCommunityCategoriesRaw(),
        GetCommunityMemberRankingRaw(),
        GetCommunityPostRankingRaw(),
        GetCommunityStatsRaw()
      ])

      const filesTotal = fileTypes.reduce(
        (sum, row) => sum + Number(row.count),
        0
      )

      const categories: CommunitiesReport["categories"] = {}
      for (const row of categoryRows) {
        categories[row.category_name] = { communities: Number(row.communities) }
      }

      const data: CommunitiesReport = {
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
          by_members: memberRankingRows.map((row) => ({
            community_id: row.community_id,
            title: row.title,
            total_members: Number(row.total_members)
          })),
          by_posts: postRankingRows.map((row) => ({
            community_id: row.community_id,
            title: row.title,
            total_posts: Number(row.total_posts)
          }))
        },
        community_stats: communityStatRows.map((row) => ({
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

      return { success: true, data }
    } catch (error) {
      console.error("Error building communities report module:", error)
      return { success: false, error }
    }
  }
)

// ─── Mentorship ──────────────────────────────────────────────────────────────

export const GetMentorshipReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const [totals, availability, sessions, feedback, rankingRows] =
        await Promise.all([
          GetMentorTotalsRaw(),
          GetMentorAvailabilityTotalsRaw(),
          GetMentorSessionTotalsRaw(),
          GetMentorFeedbackTotalsRaw(),
          GetMentorRankingRaw()
        ])

      const data: MentorshipReport = {
        total: Number(totals.total),
        active: Number(totals.active),
        verified: Number(totals.verified),
        availability: {
          total_slots: Number(availability.total_slots),
          active_slots: Number(availability.active_slots)
        },
        sessions: {
          total: Number(sessions.total),
          pending: Number(sessions.pending),
          completed: Number(sessions.completed),
          rejected: Number(sessions.rejected)
        },
        feedback: {
          total: Number(feedback.total)
        },
        ranking: {
          users: rankingRows.map((row) => ({
            info: {
              user_name: FormatUserName(row.first_name, row.last_name),
              email: row.email,
              total: Number(row.sessions_total)
            },
            sessions: {
              total: Number(row.sessions_total),
              completed: Number(row.sessions_completed),
              rejected: Number(row.sessions_rejected)
            },
            feedback: {
              total: Number(row.feedback_total)
            }
          }))
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error building mentorship report module:", error)
      return { success: false, error }
    }
  }
)

// ─── Posts ───────────────────────────────────────────────────────────────────

export const GetPostsReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const [
        total,
        byTypeRows,
        byCategoryRows,
        likes,
        comments,
        polls,
        pollOptions,
        pollVotes,
        hashtagsTotal,
        hashtagsTopRows,
        topPostsRows,
        topCreatorsRows
      ] = await Promise.all([
        GetPostTotalRaw(),
        GetPostsByTypeRaw(),
        GetPostsByCategoryRaw(),
        GetLikesTotalRaw(),
        GetCommentsTotalRaw(),
        GetPollsTotalRaw(),
        GetPollOptionsTotalRaw(),
        GetPollVotesTotalRaw(),
        GetHashtagsTotalRaw(),
        GetHashtagsTopRaw(),
        GetTopPostsRaw(),
        GetTopCreatorsRaw()
      ])

      const data: PostsReport = {
        total: Number(total.total),
        by_type: byTypeRows.map((row) => ({
          value: row.value,
          count: Number(row.count)
        })),
        by_category: byCategoryRows.map((row) => ({
          value: row.value,
          count: Number(row.count)
        })),
        likes: { total: Number(likes.total) },
        comments: { total: Number(comments.total) },
        polls: {
          total: Number(polls.total),
          options: {
            total: Number(pollOptions.total),
            votes: { total: Number(pollVotes.total) }
          }
        },
        hashtags: {
          total: Number(hashtagsTotal.total),
          top: hashtagsTopRows.map((row) => ({
            hashtag_id: Number(row.hashtag_id),
            tag: row.tag,
            uses: Number(row.uses)
          }))
        },
        ranking: {
          top_posts: topPostsRows.map((row) => ({
            post_id: row.post_id,
            author: {
              user_id: row.user_id,
              user_name: FormatUserName(row.first_name, row.last_name)
            },
            likes: Number(row.likes_total),
            comments: Number(row.comments_total)
          })),
          top_creators: topCreatorsRows.map((row) => ({
            user_id: row.user_id,
            user_name: FormatUserName(row.first_name, row.last_name),
            email: row.email,
            total_posts: Number(row.total_posts)
          }))
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error building posts report module:", error)
      return { success: false, error }
    }
  }
)

// ─── Rewards ─────────────────────────────────────────────────────────────────

async function BuildRewardTypeBlock(
  rewardId: number
): Promise<RewardTypeBlock> {
  const [balanceTotal, actionsTotal, ruleRows, rankingRows] = await Promise.all(
    [
      GetRewardBalanceTotalRaw(rewardId),
      GetRewardActionsTotalRaw(rewardId),
      GetRewardRulesRaw(rewardId),
      GetRewardRankingRaw(rewardId)
    ]
  )

  const rules: RewardTypeBlock["actions"]["rules"] = {}
  for (const row of ruleRows) {
    rules[row.action_type] = { total: Number(row.count) }
  }

  return {
    total: Number(balanceTotal.total),
    actions: {
      total: Number(actionsTotal.total),
      rules
    },
    ranking: {
      users: rankingRows.map((row) => ({
        info: {
          user_name: FormatUserName(row.first_name, row.last_name),
          email: row.email,
          total: Number(row.balance)
        },
        level:
          row.level_id !== null
            ? { level_id: Number(row.level_id), level_name: row.level_name! }
            : null,
        actions: {
          total: Number(row.actions_total),
          type: (row.actions_by_type ?? []).map((entry) => ({
            action_type: entry.action_type,
            count: Number(entry.count)
          }))
        }
      }))
    }
  }
}

export const GetRewardsReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const rewardIds = await GetRewardIdsByInternalName()

      const [ledgerTotal, rpBlock, scBlock] = await Promise.all([
        // Count of ledger transactions across both reward types — unit-agnostic
        // "how many reward events happened," not a sum of RP+SC balances
        // (those are different units and summing them would be meaningless).
        GetLedgerTotalRaw(),
        BuildRewardTypeBlock(rewardIds[RewardTypes.Reputation_Points]),
        BuildRewardTypeBlock(rewardIds[RewardTypes.Spark_Credits])
      ])

      const data: RewardsReport = {
        total: Number(ledgerTotal.total),
        types: {
          rp_points: rpBlock,
          sc_points: scBlock
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error building rewards report module:", error)
      return { success: false, error }
    }
  }
)

// ─── Events ──────────────────────────────────────────────────────────────────

export const GetEventsReportModuleAction = CreateServerAction(
  false,
  async () => {
    try {
      const [
        eventType,
        registrationsTotal,
        hostsTotal,
        hostRankingRows,
        tagsTotal,
        tagRankingRows
      ] = await Promise.all([
        GetEventTypeStatsRaw(),
        GetEventRegistrationsTotalRaw(),
        GetEventHostsTotalRaw(),
        GetEventHostRankingRaw(),
        GetEventTagsTotalRaw(),
        GetEventTagRankingRaw()
      ])

      const data: EventsReport = {
        total: Number(eventType.total),
        type: {
          upcoming: Number(eventType.upcoming),
          completed: Number(eventType.completed),
          registrations: Number(registrationsTotal.total)
        },
        hosts: {
          total: Number(hostsTotal.total),
          ranking: hostRankingRows.map((row) => ({
            host_id: row.host_id,
            user_name: FormatUserName(row.first_name, row.last_name),
            email: row.email,
            total_events: Number(row.total_events)
          }))
        },
        tags: {
          total: Number(tagsTotal.total),
          ranking: tagRankingRows.map((row) => ({
            tag: row.tag,
            count: Number(row.count)
          }))
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error building events report module:", error)
      return { success: false, error }
    }
  }
)
