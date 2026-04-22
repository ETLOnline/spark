import { ProjectSettings } from "@/src/components/Dashboard/ProjectManagement/ProjectSettings/ProjectSettings"
import React from "react"
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { ScrollArea } from "@/src/components/ui/scroll-area"

interface Props {
  params: Promise<{ id: string }>
}

async function page({ params }: Props) {
  const { id } = await params
  const projectId = id

  const currProject = await GetProjectByIdAction(projectId)
  if (!currProject.success || !currProject.data) {
    return <NotFound />
  }
  return (
    <ScrollArea className="min-h-full">
      <ProjectSettings currProject={currProject.data} />
    </ScrollArea>
  )
}

export default page
