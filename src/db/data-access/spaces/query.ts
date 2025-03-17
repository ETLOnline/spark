import { and, eq } from "drizzle-orm"
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

export async function IsSlugAvailable(
  slug: string,
  channelId: string
): Promise<boolean> {
  try {
    const searchedSlug = await db
      .select()
      .from(spacesTable)
      .where(
        and(
          eq(spacesTable.space_slug, slug),
          eq(spacesTable.channel_id, channelId)
        )
      )
    return !searchedSlug.length
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetSpaceIdBySlug(slug: string, channelId: string) {
  try {
    const space = await db
      .select({ id: spacesTable.id })
      .from(spacesTable)
      .where(
        and(
          eq(spacesTable.space_slug, slug),
          eq(spacesTable.channel_id, channelId)
        )
      )
      .limit(1)

    if (!space.length) {
      throw new Error("Space not found")
    }
    return space[0].id
  } catch (e: any) {
    throw new Error(e.message)
  }
}
