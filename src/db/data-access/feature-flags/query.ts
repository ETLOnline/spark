import { eq, inArray } from "drizzle-orm"
import { db } from "../.."
import {
  featureFlagsTable,
  InsertFeatureFlag,
  SelectFeatureFlag
} from "../../schema"

export const getFeatureFlag = async (
  key: string[]
): Promise<SelectFeatureFlag | undefined> => {
  try {
    const flag = await db.query.featureFlagsTable.findFirst({
      where: inArray(featureFlagsTable.key, key)
    })
    return flag
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const createFeatureFlag = async (
  data: InsertFeatureFlag
): Promise<SelectFeatureFlag> => {
  try {
    const [flag] = await db.insert(featureFlagsTable).values(data).returning()
    return flag
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const updateFeatureFlag = async (
  key: string,
  changes: Partial<InsertFeatureFlag>
): Promise<SelectFeatureFlag | undefined> => {
  try {
    const flag = await db.query.featureFlagsTable.findFirst({
      where: eq(featureFlagsTable.key, key)
    })
    if (!flag) {
      throw new Error("Feature flag not found")
    }
    const [updated] = await db
      .update(featureFlagsTable)
      .set(changes)
      .where(eq(featureFlagsTable.key, key))
      .returning()
    return updated
  } catch (error: any) {
    throw new Error(error.message)
  }
}
