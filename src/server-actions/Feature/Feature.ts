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
        space?.space_slug || "",
        undefined,
        space?.created_by
      )

      await AddRewardAction(
        ActivityTypes.SpaceFeatureUpdate,
        authUser.unique_id,
        spaceURL,
        {
          space_id: spaceId,
          channel_id: space?.channel?.id,
          community_id: space?.channel?.community_id
        },
        undefined,
        "space_id",
        spaceId
      )

      return { success: true, data: space }
    } catch (error) {
      return { error: error, data: [] }
    }
  }
)
