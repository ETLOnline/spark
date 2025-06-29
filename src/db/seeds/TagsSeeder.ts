import { sql } from "drizzle-orm"
import { db } from ".."
import { tagsTable } from "../schema"
import { interestSeedList } from "./InterestSeedList"
import { skillSeedList } from "./SkillsSeedList"

const tagSeedList = [
  ...skillSeedList.map((name) => ({ name, type: "skill", count: 1 })),
  ...interestSeedList.map((name) => ({ name, type: "interest", count: 1 }))
]

export const seedTags = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(tagsTable).where(sql`type IN ('skill', 'interest')`)
      await tx.execute(sql`ALTER SEQUENCE tags_id_seq RESTART WITH 1;`)

      const res = await tx.insert(tagsTable).values(tagSeedList)

      if (res.count === tagSeedList.length) {
        console.log(`✅ Seeded ${res.count} tags successfully.`)
      } else {
        console.warn(
          `⚠️ Expected ${tagSeedList.length} but inserted ${res.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding tags:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}
