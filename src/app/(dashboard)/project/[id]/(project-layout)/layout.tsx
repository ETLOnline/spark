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

  if (!currProject.success || !currProject.data || currProject.error) {
    return <NotFound />
  }

  const currentProject = currProject.data

  if (!currentProject.space_id) {
    return <NotFound />
  }

  const currSpace = await GetSpaceByIdAction(currentProject.space_id)

  const projectStatusList = await GetTaskStatusAction(projectId)

  const projectUser = await getProjectUsers(projectId)

  const authUser = await AuthUserAction()
  const isAdmin = await isSuperAdmin(authUser)

  const userRole = authUser.unique_id
    ? projectUser.find((user) => user.user_id === authUser.unique_id)
    : undefined

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 w-full h-[calc(100vh-6rem)] overflow-hidden">
      {userRole || isAdmin ? (
        <>
          <div className="md:col-span-2 md:border-r md:overflow-y-auto border-b md:border-b-0 mb-2 shrink-0">
            <ProjectSidebar
              currProject={currentProject}
              statusList={projectStatusList.data ?? []}
              currSpace={currSpace.data}
            />
          </div>

          <div className="flex-1 md:col-span-10 overflow-hidden min-h-0">
            <div className="grid grid-cols-1 h-full px-2 md:px-4">
              {children}
            </div>
          </div>
        </>
      ) : (
        <PrivatePage
          page="project"
          pageHref={`/channels/${currSpace.data?.channel.channel_slug}/spaces/${currSpace.data?.space_slug}?page-type=project-management`}
        />
      )}
    </div>
  )
}

export default layout
