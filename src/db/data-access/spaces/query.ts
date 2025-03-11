import { eq } from "drizzle-orm"
import { db } from "../.."
import { InsertSpace, spacesTable } from "../../schema"

export async function CreateSpace(spaceData: InsertSpace) {
  try {
    const space = await db.insert(spacesTable).values(spaceData).returning()
    return space
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetSpaces(channelId: string) {
  try {
    const spaces = await db
      .select()
      .from(spacesTable)
      .where(eq(spacesTable.channel_id, channelId))
    return spaces
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function GetSpacesBySlug(channelSlug: string) {
  try {
    const spaces = await db
      .select()
      .from(spacesTable)
      .where(eq(spacesTable.channel_slug, channelSlug))
    return spaces
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function IsSlugAvailable(slug: string): Promise<boolean> {
  try {
    const searchedSlug = await db
      .select()
      .from(spacesTable)
      .where(eq(spacesTable.channel_slug, slug))
    return !searchedSlug.length
  } catch (e: any) {
    throw new Error(e.message)
  }
}