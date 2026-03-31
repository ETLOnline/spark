import { getFeatureFlag } from "@/src/db/data-access/feature-flags/query"
import { CreateServerAction } from ".."

export const getFeatureFlagAction = CreateServerAction(
  true,
  async (key: string) => {
    try {
      const flag = await getFeatureFlag(key)
      return { success: true, data: flag }
    } catch (error: any) {
      return { error: error.message, data: null }
    }
  }
)
