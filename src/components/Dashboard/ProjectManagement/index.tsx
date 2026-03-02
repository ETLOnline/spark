"use client"

import { useEffect, useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { SprintManagement } from "./SprintManagement/SprintManagement"
import { BacklogManagement } from "./BacklogManagement/BacklogManagement"
import { FileSharing } from "./FileSharing"
import ProjectOverView from "./ProjectOverView/ProjectOverView"
import {
  InsertTaskStatus,
  SelectProject,
  SelectSpace,
  SelectSpaceUser,
  SelectProjectUser
} from "@/src/db/schema"
import { useRouter, useSearchParams } from "next/navigation"
import { useAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { AlertCircle, Settings } from "lucide-react"
import { Button } from "../../ui/button"
import ProjectTeamList, {
  ProjectUser
} from "@/src/components/Dashboard/ProjectManagement/ProjectTeamList/ProjectTeamList"
import { GetProjectUsersAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import StatusRequiredDialog from "./StatusRequiredDialog"

interface Props {
  currProject: SelectProject
  statusList: InsertTaskStatus[]
  currSpace: SelectSpace
  spaceUsers: SelectSpaceUser[]
}

export function ProjectDashboard({
  currProject,
  statusList,
  currSpace,
  spaceUsers
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const UrlTab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(UrlTab || "overview")
  const [project, setProject] = useAtom(projectStore.currProject)
  const [projectStatusList, setProjectStatusList] = useAtom(
    projectStore.projectStatusList
  )
  const [openDialog, setOpenDialog] = useState(false)
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([])

  useEffect(() => {
    if (UrlTab !== activeTab) {
      router.push(`./board?tab=${activeTab}`)
    }
  }, [activeTab, UrlTab])

  useEffect(() => {
    setProject(currProject)
  }, [currProject])

  useEffect(() => {
    if (statusList) {
      setProjectStatusList(statusList)
    }
  }, [statusList])

  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  useEffect(() => {
    const fetchProjectUsers = async () => {
      const res = await GetProjectUsersAction(currProject.id)
      if (res.success && res.data) {
        // Transform SelectProjectUser[] to ProjectUser[] by matching with spaceUsers
        const projectUsersWithUserData: ProjectUser[] = res.data
          .map((projectUser) => {
            const matchingSpaceUser = spaceUsers.find(
              (spaceUser) => spaceUser.user_id === projectUser.user_id
            )

            if (matchingSpaceUser?.user) {
              return {
                ...projectUser,
                user: matchingSpaceUser.user
              } as ProjectUser
            }
            return null
          })
          .filter((user): user is ProjectUser => user !== null)

        setProjectUsers(projectUsersWithUserData)
      }
    }
    fetchProjectUsers()
  }, [currProject.id, spaceUsers])

  if (projectStatusList.length === 0) {
    return <StatusRequiredDialog openDialog={openDialog} />
  }

  return (
    <Tabs
      defaultValue="overview"
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-4"
    >
      <TabsList className="flex justify-between gap-2">
        <TabsTrigger className="w-full" value="overview">
          Overview
        </TabsTrigger>
        <TabsTrigger className="w-full" value="sprints">
          Sprints
        </TabsTrigger>
        <TabsTrigger className="w-full" value="backlog">
          Backlog
        </TabsTrigger>
        <TabsTrigger className="w-full" value="files">
          Files
        </TabsTrigger>
        <TabsTrigger className="w-full" value="team">
          Team
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sprints">
        <SprintManagement />
      </TabsContent>

      <TabsContent value="backlog">
        <BacklogManagement />
      </TabsContent>

      <TabsContent value="backlog">
        <BacklogManagement />
      </TabsContent>

      <TabsContent value="files">
        <FileSharing />
      </TabsContent>

      <TabsContent value="team" className="space-y-4">
        <ProjectTeamList
          projectId={currProject.id}
          spaceId={currSpace.id}
          projectUsers={projectUsers}
          projectCreatorId={currProject.created_by}
        />
      </TabsContent>
    </Tabs>
  )
}
