import { ProjectScreen } from '@/src/components/Dashboard/Projects'
import React, { Suspense } from 'react'

const ProjectManagement = () => {
  return (
    <Suspense>
      <ProjectScreen />
    </Suspense>
  )
}

export default ProjectManagement