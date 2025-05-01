"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Calendar, Settings, Users } from "lucide-react"
import { SprintManagement } from "./SprintManagement/SprintManagement"
import { BacklogManagement } from "./BacklogManagement/BacklogManagement"
import { FileSharing } from "./FileSharing"
import ProjectOverView from "./ProjectOverView/ProjectOverView"
import { SelectProject } from "@/src/db/schema"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface Props {
  currProject: SelectProject
}


export function ProjectDashboard({ currProject }: Props) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const UrlTab = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(UrlTab || "overview")

  useEffect(() => {
    if (UrlTab !== activeTab) {
      router.push(`./board?tab=${activeTab}`)
    }
  }, [activeTab, UrlTab])

  return (
    <div className="grid grid-cols-1  p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{currProject.project_name}</h1>
          <p className="text-muted-foreground">{currProject.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Timeline
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Start Date</span>
                  <span className="text-sm font-semibold">2023-11-15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Target Date</span>
                  <span className="text-sm font-semibold text-primary">2024-03-20</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Link href={`./settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex justify-between gap-2">
          <TabsTrigger className="w-full" value="overview">Overview</TabsTrigger>
          <TabsTrigger className="w-full" value="sprints">Sprints</TabsTrigger>
          <TabsTrigger className="w-full" value="backlog">Backlog</TabsTrigger>
          <TabsTrigger className="w-full" value="files">Files</TabsTrigger>
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
    </div>
  )
}

