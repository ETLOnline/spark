import { db } from ".."
import { siteSettingsTable } from "../schema"

const siteSettingsSeedList = [
  {
    key: "featured_mentors",
    value: "",
    page: "home"
  },
  {
    key: "featured_communities",
    value: "",
    page: "home"
  }
]

export const siteSettingsSeed = async () => {
  try {
    const siteSettings = await db
      .insert(siteSettingsTable)
      .values(siteSettingsSeedList)

    if (siteSettings.count === siteSettingsSeedList.length) {
      console.log("✅ Site settings seeded successfully")
    }
  } catch (e) {
    console.error(e)
    console.log("❌ Error seeding site settings")
    process.exit(1)
  }
}
