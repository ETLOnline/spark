"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import ProjectInformation from "./ProjectInformation"
import TeamMembers from "./TeamMembers"
import ProjectNotifications from "./ProjectNotifications"
import Integrations from "./Integrations"


export function ProjectSettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
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
      </Tabs>
    </div>
  )
}

