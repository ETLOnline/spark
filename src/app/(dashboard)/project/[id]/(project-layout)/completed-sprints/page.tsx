import CompletedSprints from "@/src/components/Dashboard/ProjectManagement/SprintManagement/CompletedSprints"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import React from "react"

function page() {
  return (
    <ScrollArea className="min-h-full px-4">
      <CompletedSprints />
    </ScrollArea>
  )
}

export default page
