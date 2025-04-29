import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import { ProjectDetailView } from '@/src/components/Dashboard/Projects/Details/ProjectDetailVeiw'
import { GetProjectByIdAction } from '@/src/server-actions/ProjectManagement/projectManagement'
import React from 'react'

interface Props {
  params: Promise<{ id: string }>
}

const ProjectDetailPage = async ({params}: Props) => {

  const { id } = await params
  const projectId = id

  const selectedProject = await GetProjectByIdAction(projectId || "")
  
  if(!selectedProject.success || !selectedProject.data){
    return(
      <NotFound/>
    )
  }

  return (
    <ProjectDetailView selectedProject={selectedProject.data} />
  )
}

export default ProjectDetailPage