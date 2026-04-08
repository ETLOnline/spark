"use server"

import { attachSpaceFeatures } from "@/src/db/data-access/spaces/query"
import { SelectFeature } from "@/src/db/schema"
import { CreateServerAction } from ".."
import { getFeatures } from "@/src/db/data-access/feature/query"
import { AddRewardAction } from "../Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { AuthUserAction } from "../User/AuthUserAction"
import { GetSpaceURL } from "@/src/utils/helpers"

export const getFeaturesAction = CreateServerAction(
  true,
  async (filters?: Partial<SelectFeature>) => {
    try {
      const features = await getFeatures(filters)
      return { success: true, data: features }
    } catch (error) {
      return { error: error, data: [] }
    }
  }
)

export const attachSpaceFeaturesAction = CreateServerAction(
  true,
  async (spaceId: string, featureIds: number[]) => {
    try {
      const authUser = await AuthUserAction()

      const space = await attachSpaceFeatures(spaceId, featureIds)

      const spaceURL = GetSpaceURL(
        space?.channel?.channel_slug || "",
        space?.space_slug || ""
      )

      await AddRewardAction(
        ActivityTypes.SpaceCreation,
        authUser.unique_id,
        spaceURL
      )

      return { success: true, data: space }
    } catch (error) {
      return { error: error, data: [] }
    }
  }
)
