"use server"

import {
  attachSpaceUser,
  CreateSpace,
  DeleteSpace,
  dettachSpaceUser,
  GetSpaceById,
  GetSpaceBySlug,
  GetSpaces,
  getSpaceUsers,
  IsSlugAvailable,
  spaceQueryFilters,
  UpdateSpace,
  updateSpaceUser
} from "@/src/db/data-access/spaces/query"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { CreateServerAction } from ".."
import {
  InsertSpace,
  SelectChannel,
  SelectSpace,
  SelectSpaceUser
} from "@/src/db/schema"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import { AuthUserAction } from "../User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
import {
  attachChannelUser,
  GetChannelById,
  GetChannelBySlug,
  GetChannels,
  getChannelUsers
} from "@/src/db/data-access/channels/query"
import {
  createScopedSpaceRolesAndAssignAdmin,
  deleteUserRole,
  getAndAssignViewerRoles
} from "@/src/db/data-access/roles/query"
import { defaultSpaceOverviewTemplate } from "@/src/app/(dashboard)/channels/[channel_slug]/spaces/[space_slug]/(space-layout)/components/constants"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { GetUserPermissionsParsedAction } from "../UserRoles/UserRole"
import { ensureCommunityMembership } from "../Community/Community"
import pusherServer from "@/src/services/realtime/pusherServer"

export const CreateSpaceAction = CreateServerAction(
  true,
  async (SpaceData: InsertSpace) => {
    try {
      const overview = defaultSpaceOverviewTemplate(SpaceData.space_name)
      const newSpace = await CreateSpace({ ...SpaceData, overview: overview })
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("space-add", newSpace)
      const result = await createScopedSpaceRolesAndAssignAdmin(
        newSpace.id,
        newSpace.space_name,
        newSpace.created_by
      )
      await attachSpaceUser(
        newSpace.id,
        newSpace.created_by,
        result.adminRole?.name
      )
      return { success: true, data: newSpace }
    } catch (error: any) {
      return {
        error: error
      }
    }
  }
)

export interface GetSpacesResponseType {
  spaces: SelectSpace[]
  pagination: PaginationType
}
export const GetSpacesAction = CreateServerAction(
  true,
  async (filters?: spaceQueryFilters) => {
    try {
      let spaces: GetSpacesResponseType
      let joinedSpaces: SelectSpace[] = []
      let channel: SelectChannel | undefined

      const authUser = await AuthUserAction()
      const authUserId = authUser?.unique_id

      const isAdmin = await isSuperAdmin(authUser)

      const response = await GetUserPermissionsParsedAction(authUserId)

      if (!response.success) {
        return { error: response.error }
      }

      if (filters?.channel_slug) {
        channel = await GetChannelBySlug(filters?.channel_slug || "")
      } else if (filters?.channel_id) {
        channel = await GetChannelById(filters?.channel_id || "")
      }

      if (channel) {
        filters = {
          ...filters,
          channel_id: channel.id
        }
      }

      const permissionChecker = new PermissionChecker(
        "scoped",
        response.data,
        isAdmin,
        "CHANNEL",
        channel?.id
      )

      if (isAdmin || permissionChecker.canAccess("channel.space.create")) {
        spaces = await GetSpaces({ ...filters })
      } else {
        const spacesResponse = await GetSpaces({
          ...filters,
          isPublished: true
        })
        const spaceIds = (channel?.spaces || []).map((s) => s.id)
        joinedSpaces = spacesResponse.spaces.filter(
          (space) =>
            space.users &&
            space.users.some((user) => user.user_id === authUserId)
        )

        spaces = {
          ...spacesResponse,
          spaces: spacesResponse.spaces.filter(
            (space) =>
              !(
                space.users &&
                space.users.some((user) => user.user_id === authUserId)
              )
          )
        }
      }

      return {
        success: true,
        data: { channel, paginatedSpaces: spaces, joinedSpaces }
      }
    } catch (error) {
      return { error: error }
    }
  }
)

export const IsSlugAvailableAction = CreateServerAction(
  true,
  async (slug: string, channelId: string) => {
    try {
      const isAvailable = await IsSlugAvailable(slug, channelId)
      return { success: true, data: isAvailable }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateSpaceAction = CreateServerAction(
  true,
  async (spaceID: string, updatedData: Partial<SelectSpace>) => {
    try {
      const updatedSpace = await UpdateSpace(spaceID, updatedData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("space-edit", updatedSpace)
      return { success: true, data: updatedSpace }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteSpaceAction = CreateServerAction(
  true,
  async (deletedSpaceData: SelectSpace) => {
    try {
      await DeleteSpace(deletedSpaceData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("space-del", deletedSpaceData)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceBySlugAction = CreateServerAction(
  true,
  async (spaceSlug: string, channelSlug: string, withSpaceUsers?: boolean) => {
    try {
      const space = await GetSpaceBySlug(spaceSlug, channelSlug, withSpaceUsers)
      return { success: true, data: space }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceByIdAction = CreateServerAction(
  true,
  async (spaceId: string, withSpaceUsers?: boolean) => {
    try {
      const space = await GetSpaceById(spaceId, withSpaceUsers)
      return { success: true, data: space }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AttachSpaceUserAction = CreateServerAction(
  true,
  async (spaceId: string, userId: string) => {
    try {
      const space = await GetSpaceById(spaceId, true)

      if (!space) {
        return { success: false, error: "Space not found" }
      }

      const spaceUserIds = space?.users.map((su) => su.user_id) || []

      const isUserSpaceMember = spaceUserIds.includes(userId)

      if (isUserSpaceMember) {
        return { success: true, data: null }
      }
      // this check is to make sure the user is a member of the channel
      if (space?.channel_id) {
        const channelUsers = await getChannelUsers(space?.channel_id)
        const channelUserIds = channelUsers.map((cu) => cu.user_id)

        const isUserChannelMember = channelUserIds.includes(userId)

        if (!isUserChannelMember) {
          const attachChannelUserRole = await getAndAssignViewerRoles(
            userId,
            "channel_viewer",
            space.channel_id
          )
          await attachChannelUser(
            space.channel_id,
            userId,
            attachChannelUserRole?.viewerRole?.name
          )
        }
      }
      // get channel by id and attach user
      const channel = await GetChannelById(space?.channel_id)

      if (!channel) {
        return { success: false, error: "Channel not found" }
      }

      if (channel?.community_id) {
        await ensureCommunityMembership(channel.community_id, userId)
      }

      const attachSpaceUserRole = await getAndAssignViewerRoles(
        userId,
        "space_viewer",
        spaceId
      )
      const spaceUser = await attachSpaceUser(
        spaceId,
        userId,
        attachSpaceUserRole?.viewerRole?.name
      )
      pusherServer.trigger(`user-${userId}`, "update-role", attachSpaceUserRole)
      return { success: true, data: spaceUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DetachSpaceUserAction = CreateServerAction(
  true,
  async (spaceId: string, userId: string, roleId: number) => {
    try {
      const spaceUser = await dettachSpaceUser(spaceId, userId)
      const deleteRole = await deleteUserRole(userId, roleId)
      pusherServer.trigger(`user-${userId}`, "update-role", deleteRole)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateSpaceUserAction = CreateServerAction(
  true,
  async (
    spaceId: string,
    userId: string,
    updatedData: Partial<SelectSpaceUser>
  ) => {
    try {
      const spaceUser = await updateSpaceUser(spaceId, userId, updatedData)
      return { success: true, data: spaceUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceUsersAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const spaceUsers = await getSpaceUsers(spaceId)
      return { success: true, data: spaceUsers }
    } catch (error) {
      return { error: error }
    }
  }
)
