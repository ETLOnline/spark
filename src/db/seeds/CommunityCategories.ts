import { sql } from "drizzle-orm"
import { db } from ".."
import { communityCategoriesTable } from "../schema"

const availableCategories = [
  "Technology",
  "Art & Design",
  "Health & Wellness",
  "Environment",
  "Gaming",
  "Education",
  "Travel",
  "Food",
  "Sports",
  "Science"
]

export const CommunityCategorySeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.execute(sql`TRUNCATE community_categories CASCADE;`)

      const categoriesData = availableCategories.map((category) => ({
        name: category,
        slug: category.toLowerCase().replace(/\s+/g, "-")
      }))

      const res = await tx
        .insert(communityCategoriesTable)
        .values(categoriesData)

      if (res.count === availableCategories.length) {
        console.log("✅ Categories seeded successfully")
      }
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error seeding Categories")
      process.exit(1)
    }
  })
}
