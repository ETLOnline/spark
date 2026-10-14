import { sql } from "drizzle-orm"
import { db } from "../../.."
import {
  RewardsReport,
  RewardTypeBlock
} from "@/src/types/Reporting/Reporting.schema"
import { RewardTypes } from "@/src/types/Rewards/rewards"
import {
  RawTotal,
  RawRuleRow,
  RawRankingRow,
  RawRewardIdRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"
import { FormatUserName } from "@/src/utils/helpers"

/**
 * reward_id is a manually-assigned integer (not an auto-generated identity —
 * see rewards_metadata in schema.ts), set once at seed time in
 * RewardsSeed.ts. Hardcoding 1/2 here would silently break if anyone ever
 * re-seeds with different ids. internal_name ("reputation_points" /
 * "spark_credits", via the existing RewardTypes enum) is the stable,
 * semantic key — this resolves both real ids from the DB instead.
 */
async function GetRewardIdsByInternalName(): Promise<
  Record<RewardTypes, number>
> {
  const rows = await db.execute(sql`
    select internal_name, reward_id
    from rewards_metadata
    where internal_name in (${RewardTypes.Reputation_Points}, ${RewardTypes.Spark_Credits})
  `)

  const ids = {} as Record<RewardTypes, number>
  for (const row of rows as unknown as RawRewardIdRow[]) {
    ids[row.internal_name as RewardTypes] = Number(row.reward_id)
  }

  if (
    ids[RewardTypes.Reputation_Points] === undefined ||
    ids[RewardTypes.Spark_Credits] === undefined
  ) {
    throw new Error(
      "rewards_metadata is missing a row for Reputation_Points or Spark_Credits"
    )
  }

  return ids
}

async function GetRewardTypeBlock(rewardId: number): Promise<RewardTypeBlock> {
  const [totalRows, actionsTotalRows, rulesRows, rankingRows] =
    await Promise.all([
      db.execute(sql`
        select coalesce(sum(current_balance), 0) as total
        from user_reward_balance
        where reward_id = ${rewardId}
      `),
      db.execute(sql`
        select count(*) as total from point_ledger where reward_id = ${rewardId}
      `),
      // Keyed dynamically by activity_rules.action_type — never a hardcoded
      // rule key, the contract's "post_created" example doesn't exist as a
      // real ActivityTypes value.
      db.execute(sql`
        select ar.action_type as action_type, count(*) as count
        from point_ledger pl
        inner join activity_rules ar on ar.rule_id = pl.rule_id
        where pl.reward_id = ${rewardId}
        group by ar.action_type
      `),
      db.execute(sql`
        select
          u.unique_id as user_id,
          u.first_name,
          u.last_name,
          u.email,
          coalesce(urb.current_balance, 0) as balance,
          rl.id as level_id,
          rl.name as level_name,
          coalesce(act.total, 0) as actions_total,
          coalesce(act.by_type, '[]') as actions_by_type
        from user_reward_balance urb
        inner join users u on u.unique_id = urb.user_id
        -- reward_level.reward_id scopes this correctly regardless of whether
        -- a user has one or several rows in user_rewards_level.
        left join user_rewards_level url on url.user_id = urb.user_id
        left join reward_level rl on rl.id = url.level_id and rl.reward_id = ${rewardId}
        left join lateral (
          select
            count(*) as total,
            json_agg(json_build_object('action_type', grouped.action_type, 'count', grouped.cnt)) as by_type
          from (
            select ar.action_type as action_type, count(*) as cnt
            from point_ledger pl2
            inner join activity_rules ar on ar.rule_id = pl2.rule_id
            where pl2.user_id = urb.user_id and pl2.reward_id = ${rewardId}
            group by ar.action_type
          ) grouped
        ) act on true
        where urb.reward_id = ${rewardId}
        order by urb.current_balance desc
        limit ${RANKING_LIMIT}
      `)
    ])

  const rules: RewardTypeBlock["actions"]["rules"] = {}
  for (const row of rulesRows as unknown as RawRuleRow[]) {
    rules[row.action_type] = { total: Number(row.count) }
  }

  return {
    total: Number((totalRows[0] as unknown as RawTotal).total),
    actions: {
      total: Number((actionsTotalRows[0] as unknown as RawTotal).total),
      rules
    },
    ranking: {
      users: (rankingRows as unknown as RawRankingRow[]).map((row) => ({
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

export async function GetRewardsReportModule(): Promise<RewardsReport> {
  const rewardIds = await GetRewardIdsByInternalName()

  const [totalRows, rpBlock, scBlock] = await Promise.all([
    // Count of ledger transactions across both reward types — unit-agnostic
    // "how many reward events happened," not a sum of RP+SC balances (those
    // are different units and summing them would be meaningless).
    db.execute(sql`select count(*) as total from point_ledger`),
    GetRewardTypeBlock(rewardIds[RewardTypes.Reputation_Points]),
    GetRewardTypeBlock(rewardIds[RewardTypes.Spark_Credits])
  ])

  return {
    total: Number((totalRows[0] as unknown as RawTotal).total),
    types: {
      rp_points: rpBlock,
      sc_points: scBlock
    }
  }
}
