import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { ProjectDetailView } from "@/src/components/Dashboard/Projects/Details/ProjectDetailVeiw"
import { GetSpaceById } from "@/src/db/data-access/spaces/query"
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import React from "react"
import { ScrollArea } from "@/src/components/ui/scroll-area"

interface Props {
  params: Promise<{ id: string }>
}

const ProjectDetailsPage = async ({ params }: Props) => {
  const { id } = await params

  const selectedProject = await GetProjectByIdAction(id || "")
  const currSpace = await GetSpaceById(selectedProject.data?.space_id || "")

  if (!selectedProject.success || !selectedProject.data) {
    return <NotFound />
  }

  return (
    <ScrollArea className="min-h-full">
      <ProjectDetailView
        selectedProject={selectedProject.data}
        currSpace={currSpace}
      />
    </ScrollArea>
  )
}

export default ProjectDetailsPage