import { BacklogManagement } from "@/src/components/Dashboard/ProjectManagement/BacklogManagement/BacklogManagement"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import React from "react"

function ProjectBackolgs() {
  return (
    <ScrollArea className="min-h-full px-4">
      <BacklogManagement />
    </ScrollArea>
  )
}

export default ProjectBackolgs
