import { sql } from "drizzle-orm"
import { db } from ".."
import { tagsTable } from "../schema"
import { newInterestsList } from "./InterestSeedList"
import { newSkillsList } from "./SkillsSeedList"

const newTagsSeedList = [
  ...newSkillsList.map((name) => ({ name, type: "skill", count: 1 })),
  ...newInterestsList.map((name) => ({ name, type: "interest", count: 1 }))
]

export const NewTagsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log(`🌱 Attempting to insert ${newTagsSeedList.length} tags...`)
      const res = await tx.insert(tagsTable).values(newTagsSeedList)

      console.log(`✅ Attempted to insert ${newTagsSeedList.length} tags.`)
      console.log(`☑️ Successfully inserted ${res.count} new tags.`)
    } catch (error) {
      console.error("❌ Error seeding tags:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}
