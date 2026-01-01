import React, { ReactNode } from "react"
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import ProjectSidebar from "../components/projectSidebar"
import { GetTaskStatusAction } from "@/src/server-actions/Tasks/Task"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { GetSpaceById } from "@/src/db/data-access/spaces/query"
import { getProjectUsers } from "@/src/db/data-access/project-management/query"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { GetSpaceByIdAction } from "@/src/server-actions/Space/Space"
import { isSuperAdmin } from "@/src/utils/helpers"
import PrivatePage from "@/src/components/common/Overlay/PrivatePage"

interface Props {
  children: ReactNode
  params: Promise<{ id: string }>
}

async function layout({ children, params }: Props) {
  const { id } = await params
  const projectId = id

  const currProject = await GetProjectByIdAction(projectId)

  if (!currProject.success || !currProject.data) {
    return <NotFound />
  }
  const currentProject = currProject.data

  const currSpace = await GetSpaceById(currentProject.space_id)

  const projectStatusList = await GetTaskStatusAction(projectId)

  const space = await GetSpaceByIdAction(currentProject.space_id)

  const projectUser = await getProjectUsers(projectId)

  const authUser = await AuthUserAction()
  const isAdmin = await isSuperAdmin(authUser)

  const userRole = projectUser.find(
    (user) => user.user_id === authUser.unique_id
  )

  return (
    <div className="grid grid-cols-12 w-full h-[calc(100vh-6rem)] overflow-hidden">
      {userRole || isAdmin ? (
        <>
          <div className="col-span-2 border-r p-2 pl-0 overflow-y-auto">
            <ProjectSidebar
              currProject={currentProject}
              statusList={projectStatusList.data ?? []}
              currSpace={currSpace}
            />
          </div>

          <div className="col-span-10 overflow-hidden">
            <div className="grid grid-cols-1 h-full">{children}</div>
          </div>
        </>
      ) : (
        <PrivatePage
          page="project"
          pageHref={`/channels/${space.data?.channel.channel_slug}/spaces/${space.data?.space_slug}?page-type=project-management`}
        />
      )}
    </div>
  )
}

export default layout
