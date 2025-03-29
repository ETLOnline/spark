"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Calendar, Settings, Users } from "lucide-react"
import { SprintManagement } from "./SprintManagement/SprintManagement"
import { BacklogManagement } from "./BacklogManagement/BacklogManagement"
import { FileSharing } from "./FileSharing"
import { ProjectSettings } from "./ProjectSettings/ProjectSettings"
import ProjectOverView from "./ProjectOverView/ProjectOverView"


export function ProjectDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="grid grid-cols-1  p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">E-Commerce Platform</h1>
          <p className="text-muted-foreground">Web application development project</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Timeline
          </Button>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex justify-between gap-2">
          <TabsTrigger className="w-full" value="overview">Overview</TabsTrigger>
          <TabsTrigger className="w-full" value="sprints">Sprints</TabsTrigger>
          <TabsTrigger className="w-full" value="backlog">Backlog</TabsTrigger>
          <TabsTrigger className="w-full" value="files">Files</TabsTrigger>
          <TabsTrigger className="w-full" value="settings">Settings</TabsTrigger>
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

        <TabsContent value="settings">
          <ProjectSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

