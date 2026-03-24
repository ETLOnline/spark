import { db } from "../index"
import { rolesTable } from "../schema"
import { eq } from "drizzle-orm"

const roleSeedList = [
  {
    name: "Faculty",
    slug: "faculty"
  },
  {
    name: "Mentor",
    slug: "mentor"
  },
  {
    name: "Student",
    slug: "student"
  },
  {
    name: "Industry Partner",
    slug: "industry_partner"
  }
]

export const UpdateRoleTable = async () => {
  try {
    for (const role of roleSeedList) {
      const updated = await db
        .update(rolesTable)
        .set({ slug: role.slug })
        .where(eq(rolesTable.name, role.name))

      if (updated.count > 0) {
        console.log(`✅ Updated role "${role.name}" with slug "${role.slug}"`)
      } else {
        console.warn(`⚠️ No matching role found for "${role.name}"`)
      }
    }

    console.log("🎉 Finished updating default roles with slugs.")
  } catch (error) {
    console.error("❌ Error updating roles:", error)
    process.exit(1)
  }
}
