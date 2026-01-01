import ProjectOverView from "@/src/components/Dashboard/ProjectManagement/ProjectOverView/ProjectOverView"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import React from "react"

function ProjectOverviewPage() {
  return (
    <ScrollArea className="min-h-full px-4">
      <ProjectOverView />
    </ScrollArea>
  )
}

export default ProjectOverviewPage
