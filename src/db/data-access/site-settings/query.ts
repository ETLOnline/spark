import { eq, SQLWrapper } from "drizzle-orm"
import { db } from "../.."
import { siteSettingsTable } from "../../schema"

export interface siteSettinsFilters {
  page?: string
  key?: string
}

export async function GetSiteSettings(filters?: siteSettinsFilters) {
  try {
    const whereClauses: (SQLWrapper | undefined)[] = []

    if (filters) {
      if (filters.page) {
        whereClauses.push(eq(siteSettingsTable.page, filters.page))
      }

      if (filters.key) {
        whereClauses.push(eq(siteSettingsTable.key, filters.key))
      }
    }

    const res = db.query.siteSettingsTable.findMany({
      where: eq(siteSettingsTable.page, "home")
    })

    return res
  } catch (error) {
    console.error("Error fetching site settings:", error)
    throw new Error("Failed to fetch site settings")
  }
}

export async function AddMentors(mentorsId: string[]) {
  try {
    const result = db
      .update(siteSettingsTable)
      .set({
        value: mentorsId
      })
      .where(eq(siteSettingsTable.key, "featured_mentors"))
      .returning()

    return result
  } catch (error) {
    console.error("Error adding mentors:", error)
    throw new Error("Failed to add mentors")
  }
}

export async function AddCommunities(communitiesId: string[]) {
  try {
    const result = db
      .update(siteSettingsTable)
      .set({
        value: communitiesId
      })
      .where(eq(siteSettingsTable.key, "featured_communities"))
      .returning()

    return result
  } catch (error) {
    console.error("Error adding communities:", error)
    throw new Error("Failed to add communities")
  }
}
