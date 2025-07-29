"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import ProjectInformation from "./ProjectInformation"
import ProjectNotifications from "./ProjectNotifications"
import Integrations from "./Integrations"
import { SelectProject } from "@/src/db/schema"
import TaskStatus from "./TaskStatus"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import NoDataCard from "../../Channels/ChannelDetails/NoDataCard"
import { Ban } from "lucide-react"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
interface Props {
  currProject: SelectProject
}

export function ProjectSettings({ currProject }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const UrlTab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(UrlTab || "general")

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    currProject.id
  )

  const canUpdate = permissionChecker
    ? permissionChecker.canAccess("project.update")
    : false

  useEffect(() => {
    if (UrlTab !== activeTab) {
      router.push(`./settings?tab=${activeTab}`)
    }
  }, [activeTab, UrlTab])

  if (!permissionChecker) {
    return (
      <div className="flex justify-center h-full w-full">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }
  return canUpdate ? (
    <div className="space-y-6">
      <Tabs
        defaultValue="general"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {/* for future use */}
          {/* <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger> */}
          <TabsTrigger value="taskStatus">Task status</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <ProjectInformation currProjectData={currProject} />
        </TabsContent>

        {/* for future use */}
        {/* <TabsContent value="notifications">
          <ProjectNotifications />
        </TabsContent>

        <TabsContent value="integrations">
          <Integrations />
        </TabsContent> */}

        <TabsContent value="taskStatus">
          <TaskStatus />
        </TabsContent>
      </Tabs>
    </div>
  ) : (
    <NoDataCard
      title="Access Denied"
      description="You don't have permission to update the project"
      icon={<Ban className="h-16 w-16 text-muted-foreground mb-4" />}
    />
  )
}
