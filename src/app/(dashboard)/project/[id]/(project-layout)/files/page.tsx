import { FileSharing } from "@/src/components/Dashboard/ProjectManagement/FileSharing"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import React from "react"

function ProjectFilesPage() {
  return (
    <ScrollArea className="min-h-full px-4">
      <FileSharing />
    </ScrollArea>
  )
}

export default ProjectFilesPage
