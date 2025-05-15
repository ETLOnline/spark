import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import { ProjectDashboard } from '@/src/components/Dashboard/ProjectManagement'
import { GetProjectByIdAction } from '@/src/server-actions/ProjectManagement/projectManagement'
import { GetTaskStatusAction } from '@/src/server-actions/Tasks/Task'
import React from 'react'

interface Props {
  params: Promise<{ id: string }>
}

const ProjectBoardPage = async ({ params }: Props) => {

  const { id } = await params
  const projectId = id

  const currProject = await GetProjectByIdAction(projectId)

  if (!currProject.success || !currProject.data) {
    return (
      <NotFound />
    )
  }


  const projectStatusList = await GetTaskStatusAction(projectId)


  return (
    <ProjectDashboard statusList={projectStatusList.data ?? []} currProject={currProject.data} />
  )
}

export default ProjectBoardPage