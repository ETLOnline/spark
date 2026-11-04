import { z } from "zod"
import { RankedUserInfoSchema } from "./utilities.reporting-schema"

export const RewardLevelBlockSchema = z.object({
  level_id: z.number(),
  level_name: z.string()
})

export const RewardActionTypeEntrySchema = z.object({
  action_type: z.string(),
  count: z.number()
})

export const RewardRankingUserSchema = z.object({
  info: RankedUserInfoSchema,
  level: RewardLevelBlockSchema.nullable(),
  actions: z.object({
    total: z.number(),
    type: z.array(RewardActionTypeEntrySchema)
  })
})

export const RewardRuleBlockSchema = z.object({
  total: z.number()
})

export const RewardTypeBlockSchema = z.object({
  total: z.number(),
  actions: z.object({
    total: z.number(),
    // Keyed dynamically by activity_rules.action_type — never hardcode a
    // literal key here, "post_created" in the example contract does not
    // match any real ActivityTypes enum value (closest is "social_post").
    rules: z.record(z.string(), RewardRuleBlockSchema)
  }),
  ranking: z.object({
    users: z.array(RewardRankingUserSchema)
  })
})

export const RewardsReportSchema = z.object({
  // Count of point_ledger transactions across both reward types (unit-agnostic
  // "how many reward events happened" — NOT a sum of RP+SC balances, those are
  // different units and summing them would be meaningless).
  total: z.number(),
  types: z.object({
    rp_points: RewardTypeBlockSchema, // reward_id = 1, "Reputation_Points"
    sc_points: RewardTypeBlockSchema // reward_id = 2, "Spark_Credits"
  })
})

export type RewardsReport = z.infer<typeof RewardsReportSchema>
export type RewardTypeBlock = z.infer<typeof RewardTypeBlockSchema>
