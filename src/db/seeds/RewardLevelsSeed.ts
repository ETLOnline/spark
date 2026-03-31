import { db } from ".."
import { rewardLevelTable, InsertRewardLevel } from "../schema"

const rewardLevels: InsertRewardLevel[] = [
  {
    id: 1,
    name: "Spark Starter",
    description: "Basic access, join communities",
    key: "spark_starter",
    min_points: 0,
    max_points: 500,
    reward_id: 2
  },
  {
    id: 2,
    name: "Spark Contributor",
    description: "Post & comments, find mentors",
    key: "spark_contributor",
    min_points: 500,
    max_points: 1500,
    reward_id: 2
  },
  {
    id: 3,
    name: "Spark Collaborator",
    description: "Lead discussions, advanced projects",
    key: "spark_collaborator",
    min_points: 1500,
    max_points: 3000,
    reward_id: 2
  },
  {
    id: 4,
    name: "Spark Leader",
    description: "Mentor others, host workshops",
    key: "spark_leader",
    min_points: 3000,
    max_points: 5000,
    reward_id: 2
  },
  {
    id: 5,
    name: "Spark Champion",
    description: "Platform leadership, exclusive perks",
    key: "spark_champion",
    min_points: 5000,
    max_points: null, // open-ended
    reward_id: 2
  }
]

export const RewardLevelsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(rewardLevelTable)

      await tx.insert(rewardLevelTable).values(rewardLevels)

      console.log("✅ Reward levels seeded successfully")
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error seeding reward levels")
      process.exit(1)
    }
  })
}
