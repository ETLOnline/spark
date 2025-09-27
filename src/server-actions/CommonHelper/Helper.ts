import { deleteRolesAndAssociatedData } from "@/src/db/data-access/roles/query"
import { GetChannelsByCommunityIdAction } from "../Channel/Channel"
import { GetSpaceByChannelIdsAction } from "../Space/Space"
import { GetProjectBySpaceIdsAction } from "../ProjectManagement/projectManagement"
import { CreateServerAction } from ".."

// delete role based on entity type
export const deleteRoleBasedOnEntityType = CreateServerAction(
  true,
  async (entityType: string, entityId: string) => {
    let channelIds: string[] = []
    let spaceIds: string[] = []
    let projectIds: string[] = []

    if (entityType === "COMMUNITY") {
      await deleteRolesAndAssociatedData([entityId])

      const responseChannels =
        (await GetChannelsByCommunityIdAction(entityId)) || []
      const channels = responseChannels?.data || []
      channelIds = channels.map((channel) => channel.id)
      await deleteRolesAndAssociatedData(channelIds)

      const responseSpaces = await GetSpaceByChannelIdsAction(channelIds)
      const spaces = responseSpaces?.data || []
      spaceIds = spaces.map((space) => space.id)
      await deleteRolesAndAssociatedData(spaceIds)

      const responseProjects = await GetProjectBySpaceIdsAction(spaceIds)
      const projects = responseProjects?.data || []
      projectIds = projects.map((project) => project.id)
      await deleteRolesAndAssociatedData(projectIds)
    } else if (entityType === "CHANNEL") {
      await deleteRolesAndAssociatedData([entityId])

      const responseSpaces = await GetSpaceByChannelIdsAction([entityId])
      const spaces = responseSpaces?.data || []
      spaceIds = spaces.map((space) => space.id)
      await deleteRolesAndAssociatedData(spaceIds)

      const responseProjects = await GetProjectBySpaceIdsAction(spaceIds)
      const projects = responseProjects?.data || []
      projectIds = projects.map((project) => project.id)
      await deleteRolesAndAssociatedData(projectIds)
    } else if (entityType === "SPACE") {
      await deleteRolesAndAssociatedData([entityId])

      const responseProjects = await GetProjectBySpaceIdsAction([entityId])
      const projects = responseProjects?.data || []
      projectIds = projects.map((project) => project.id)
      await deleteRolesAndAssociatedData(projectIds)
    } else if (entityType === "PROJECT") {
      await deleteRolesAndAssociatedData([entityId])
    }
  }
)
