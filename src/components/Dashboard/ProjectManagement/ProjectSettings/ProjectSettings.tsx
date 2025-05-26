"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import ProjectInformation from "./ProjectInformation"
import TeamMembers from "./TeamMembers"
import ProjectNotifications from "./ProjectNotifications"
import Integrations from "./Integrations"
import TaskStatus from "./TaskStatus"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function ProjectSettings() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const UrlTab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(UrlTab || "general")

  useEffect(() => {
    if (UrlTab !== activeTab) {
      router.push(`./settings?tab=${activeTab}`)
    }
  }, [activeTab, UrlTab])

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="general"
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="taskStatus">Task status</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <ProjectInformation />
        </TabsContent>

        <TabsContent value="team">
          <TeamMembers />
        </TabsContent>

        <TabsContent value="notifications">
          <ProjectNotifications />
        </TabsContent>

        <TabsContent value="integrations">
          <Integrations />
        </TabsContent>

        <TabsContent value="taskStatus">
          <TaskStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
