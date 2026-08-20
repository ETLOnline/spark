import { db } from ".."
import { personalEmailDomainsTable } from "../schema"
import { personalEmailDomainsSeedList } from "./PersonalEmailDomainsSeedList"

export const PersonalEmailDomainsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(personalEmailDomainsTable)

      const res = await tx
        .insert(personalEmailDomainsTable)
        .values(personalEmailDomainsSeedList.map((domain) => ({ domain })))

      if (res.count === personalEmailDomainsSeedList.length) {
        console.log(
          `✅ Seeded ${res.count} personal email domains successfully.`
        )
      } else {
        console.warn(
          `⚠️ Expected ${personalEmailDomainsSeedList.length} but inserted ${res.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding personal email domains:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}
