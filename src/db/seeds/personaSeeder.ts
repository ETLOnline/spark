import { sql } from "drizzle-orm"
import { db } from "../index"
import { personasTable } from "../schema"

const personaSeedList = [
  {
    title: "Admin",
    slug: "admin",
    status: "active",
    description: "Manage and oversee platform operations"
  },
  {
    title: "Mentor",
    slug: "mentor",
    status: "active",
    description: "Guide and support others in their journey"
  },
  {
    title: "Student",
    slug: "student",
    status: "active",
    description: "Learn and grow with expert guidance"
  },
  {
    title: "Industry Partner",
    slug: "industry-partner",
    status: "active",
    description: "Connect academia with real-world experience"
  }
]

export const seedPersonas = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(personasTable)

      await tx.execute(sql`ALTER SEQUENCE personas_id_seq RESTART WITH 1;`)

      const res = await tx.insert(personasTable).values(personaSeedList)

      if (res.count === personaSeedList.length) {
        console.log(`✅ Seeded ${res.count} personas successfully.`)
      } else {
        console.warn(
          `⚠️ Expected to insert ${personaSeedList.length} but got ${res.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding personas:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}

seedPersonas().finally(() => process.exit(0))
