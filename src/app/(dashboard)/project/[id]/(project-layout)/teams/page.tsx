"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ProjectTeamList, {
  ProjectUser
} from "@/src/components/Dashboard/ProjectManagement/ProjectTeamList/ProjectTeamList"
import {
  GetProjectByIdAction,
  GetProjectUsersAction
} from "@/src/server-actions/ProjectManagement/projectManagement"
import {
  GetSpaceByIdAction,
  GetSpaceUsersAction
} from "@/src/server-actions/Space/Space"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import {
  SelectProject,
  SelectSpace,
  SelectProjectUser,
  SelectSpaceUser
} from "@/src/db/schema"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useAtomValue } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import StatusRequiredDialog from "@/src/components/Dashboard/ProjectManagement/StatusRequiredDialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"

const TeamPage: React.FC = () => {
  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const [currProject, setCurrProject] = useState<SelectProject | null>(null)
  const [currSpace, setCurrSpace] = useState<SelectSpace | null>(null)
  const [spaceUsers, setSpaceUsers] = useState<SelectSpaceUser[]>([])
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([])
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  useEffect(() => {
    async function fetchData() {
      if (!projectId) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setNotFound(false)

      try {
        const projectResult = await GetProjectByIdAction(projectId)
        if (!projectResult.success || !projectResult.data) {
          setNotFound(true)
          setIsLoading(false)
          return
        }
        setCurrProject(projectResult.data)

        const spaceResult = await GetSpaceByIdAction(
          projectResult.data.space_id
        )
        if (!spaceResult.success || !spaceResult.data) {
          setNotFound(true)
          setIsLoading(false)
          return
        }
        setCurrSpace(spaceResult.data)

        const [spaceUsersResult, projectUsersResult] = await Promise.all([
          GetSpaceUsersAction(spaceResult.data.id),
          GetProjectUsersAction(projectId)
        ])

        if (!spaceUsersResult.success || !spaceUsersResult.data) {
          setSpaceUsers([])
        } else {
          setSpaceUsers(spaceUsersResult.data)
        }

        if (projectUsersResult.success && projectUsersResult.data) {
          const mappedProjectUsers: ProjectUser[] = projectUsersResult.data
            .map((pu: SelectProjectUser) => {
              const matchedUser = spaceUsersResult.data?.find(
                (su) => su.user_id === pu.user_id
              )
              if (!matchedUser || !matchedUser.user) return null

              return {
                ...pu,
                user: matchedUser.user as ProjectUser["user"] // explicit cast
              }
            })
            .filter((pu): pu is ProjectUser => pu !== null)

          setProjectUsers(mappedProjectUsers)
        } else {
          setProjectUsers([])
        }
      } catch (error) {
        console.error("Error fetching project team data:", error)
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  if (notFound) return <NotFound />

  if (isLoading)
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader size={LoaderSizes.xl} />
      </div>
    )

  if (!currProject || !currSpace) return <NotFound />

  return projectStatusList.length > 0 ? (
    <ScrollArea className="min-h-full px-4">
      <div className="p-6">
        <ProjectTeamList
          projectId={currProject.id}
          spaceId={currSpace.id}
          projectUsers={projectUsers}
          projectCreatorId={currProject.created_by}
        />
      </div>
    </ScrollArea>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}

export default TeamPage
