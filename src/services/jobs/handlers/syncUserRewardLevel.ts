import {
  assignUserRewardLevel,
  GetRewardLevel,
  GetRewardLevels,
  UpdateUserRewardlevel
} from "@/src/db/data-access/reward/query"
import { SelectActivityRules } from "@/src/db/schema"
import { RewardTypes } from "@/src/types/Rewards/rewards"
import { triggerPusherEvent } from "../../trigger"

export async function syncUserRewardLevel(
  user_id: string,
  currentBalance: number,
  activity_rule: SelectActivityRules
) {
  const [currentLevel, levelBasedOnPoints, rewardLevels] = await Promise.all([
    import("@/src/db/data-access/reward/query").then((m) =>
      m.GetUserRewardLevel(user_id)
    ),
    GetRewardLevel(currentBalance),
    GetRewardLevels()
  ])

  if (!levelBasedOnPoints) return

  if (!currentLevel) {
    await assignUserRewardLevel(user_id, rewardLevels[0].id)
    return
  }

  if (activity_rule.reward?.internal_name !== RewardTypes.Reputation_Points)
    return
  if (currentLevel.level_id === levelBasedOnPoints.id) return

  await UpdateUserRewardlevel(user_id, levelBasedOnPoints.id)
  await triggerPusherEvent(user_id, "level_up", {
    newLevel: levelBasedOnPoints,
    currentUserBalance: currentBalance
  })
}
