import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { channelsTable, InsertSpace, SelectSpace, spaceFeaturesTable, spacesTable } from "../../schema"

export async function CreateSpace(spaceData: InsertSpace) {
  try {
    const space = await db.insert(spacesTable).values(spaceData).returning()
    return space[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetSpaces(channelId: string) {
  try {
    const spaces = await db.query.spacesTable.findMany({
      where: eq(spacesTable.channel_id, channelId),
      with: {
        features: true,
        owner: true
      }
    })
    return spaces
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function GetSpaceBySlug(spaceSlug: string, channelSlug: string) {
  try {
    const channel = await db.query.channelsTable.findFirst({
      where: eq(channelsTable.channel_slug, channelSlug),
      with: {
        spaces: {
          where: eq(spacesTable.space_slug, spaceSlug),
          with: {
            channel: true,
            features: true,
          }
        }
      }
    })
    if (!channel || !channel.spaces.length) {
      return null
    }
    return channel.spaces[0]
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

export async function attachSpaceFeatures(spaceId: string, featureIds: number[]) {
  try {
    const spaceFeatureList = featureIds.map((featureId) => ({
      space_id: spaceId,
      feature_id: featureId,
    }))

    const spaceFeatures = await db.transaction(async(tx)=>{
      await tx.delete(spaceFeaturesTable).where(eq(spaceFeaturesTable.space_id, spaceId))
      return await tx.insert(spaceFeaturesTable).values(spaceFeatureList).returning()
    })
    return spaceFeatures
  } catch (e: any) {
    throw new Error(e.message)
  }
}
