import React from 'react'
import { Badge } from '../../../ui/badge'
import { Calendar } from 'lucide-react'
import { Progress } from '../../../ui/progress'
import { ProjectDetails } from './ProjectDetailView'


interface Props {
  project: ProjectDetails
}

function ProjectDetail({ project }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Project Details</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <Badge variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"}>
            {project.status}
          </Badge>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          <span className="text-sm">Started: {new Date(project.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          <span className="text-sm">Target: {new Date(project.targetDate).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-sm font-medium">Progress</span>
          <Progress value={project.progress} className="mt-1" />
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail