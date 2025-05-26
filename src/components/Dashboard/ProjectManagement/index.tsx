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
import { InsertTaskStatus, SelectProject } from "@/src/db/schema"
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

interface Props {
  currProject: SelectProject
  statusList: InsertTaskStatus[]
}

export function ProjectDashboard({ currProject, statusList }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const UrlTab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(UrlTab || "overview")
  const [project, setProject] = useAtom(projectStore.currProject)
  const [projectStatusList, setProjectStatusList] = useAtom(
    projectStore.projectStatusList
  )
  const [openDialog, setOpenDialog] = useState(false)

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

  return projectStatusList.length > 0 ? (
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
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <ProjectOverView />
      </TabsContent>

      <TabsContent value="sprints">
        <SprintManagement />
      </TabsContent>

      <TabsContent value="backlog">
        <BacklogManagement />
      </TabsContent>

      <TabsContent value="files">
        <FileSharing />
      </TabsContent>
    </Tabs>
  ) : (
    <Dialog open={openDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Status Required
          </DialogTitle>
          <DialogDescription>
            You need to add a statuses to access this project. Please go to the
            project settings page to set up project statuses.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="gap-2"
            onClick={() => router.push(`./settings?tab=taskStatus`)}
          >
            <Settings className="h-4 w-4" />
            Go to Project Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
