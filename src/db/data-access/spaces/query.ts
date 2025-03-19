import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { InsertSpace, SelectSpace, spacesTable } from "../../schema"

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

export async function UpdateSpace(
  spaceID: string,
  updatedSpaceData: Partial<SelectSpace>
) {
  try {
    const UpdateSpace = await db
      .update(spacesTable)
      .set(updatedSpaceData)
      .where(eq(spacesTable.id, spaceID))
      .returning()
    return UpdateSpace[0]
  } catch (e: any) {
    return new Error(e.message)
  }
}

export async function DeleteSpace(deletedSpaceData: SelectSpace) {
  try {
    const deletedSpace = await db
      .delete(spacesTable)
      .where(eq(spacesTable.id, deletedSpaceData.id))
    return deletedSpace
  } catch (e: any) {
    throw new Error(e.message)
  }
}
