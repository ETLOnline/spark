import { eq } from "drizzle-orm"
import { db } from "../.."
import { featureFlagsTable, SelectFeatureFlag } from "../../schema"

export const getFeatureFlag = async (
  key: string
): Promise<SelectFeatureFlag | undefined> => {
  try {
    const flag = await db.query.featureFlagsTable.findFirst({
      where: eq(featureFlagsTable.key, key)
    })
    return flag
  } catch (error: any) {
    throw new Error(error.message)
  }
}
