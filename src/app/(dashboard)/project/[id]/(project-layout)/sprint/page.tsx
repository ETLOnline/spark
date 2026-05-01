import { SprintManagement } from "@/src/components/Dashboard/ProjectManagement/SprintManagement/SprintManagement"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import React from "react"

function ProjectSprintspage() {
  return (
    <ScrollArea className="h-full px-3">
      <SprintManagement />
    </ScrollArea>
  )
}

export default ProjectSprintspage
