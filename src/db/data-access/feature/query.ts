import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { featuresTable, SelectFeature } from "../../schema"

export const getFeatures = async (filters?: Partial<SelectFeature>) => {
  try {
    const features = await db.query.featuresTable.findMany({
      where: and(eq(featuresTable.feature_type, filters?.feature_type || ""))
    })
    return features
  } catch (error: any) {
    console.error(error)
    throw new Error(error.message)
  }
}

export const getFeature = async (featureId: number) => {
  try {
    const feature = await db.query.featuresTable.findFirst({
      where: eq(featuresTable.id, featureId)
    })
    return feature
  } catch (error: any) {
    throw new Error(error.message)
  }
}
