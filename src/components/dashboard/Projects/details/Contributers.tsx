import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar'
import { ProjectDetails } from './ProjectDetailView'

interface Props {
  project: ProjectDetails
}

function Contributers({ project }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Contributors</h3>
      <div className="space-y-2">
        {project.contributors.map((contributor) => (
          <div key={contributor.id} className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={contributor.avatar} alt={contributor.name} />
              <AvatarFallback>{contributor.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{contributor.name}</p>
              <p className="text-xs text-muted-foreground">{contributor.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Contributers