import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { LinkAsButton } from '../../LinkAsButton/LinkAsButton'
import { SelectProject } from '@/src/db/schema'
import { ProjectType } from '../../common/types/project.type'



interface Props {
  project: SelectProject
}

function ProjectCards({ project }: Props) {
  return (
    <Card key={project.id} className="mb-4">
      <CardHeader >
        <div className="flex justify-between items-start">
          <CardTitle>{project.project_name}</CardTitle>
          <Badge
            variant={
              project.project_type === ProjectType.Active
                ? "default"
                : project.project_type === ProjectType.Draft
                  ? "secondary"
                  : "outline"
            }>
            {project.project_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {project.description}
        </p>

      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-2">
          {/* <Avatar className="h-8 w-8">
            <AvatarImage
              src={project.author.avatar}
              alt={project.author.name}
            />
            <AvatarFallback>
              {project.author.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {project.author.name}
          </span> */}
        </div>
        <div className='flex items-center space-x-2'>
          <LinkAsButton href={`/project/${project.id}/board`}>
            Launch Board
          </LinkAsButton>
          <LinkAsButton href={`/project/${project.id}`} >
            View Details
          </LinkAsButton>
        </div>
      </CardFooter>
    </Card >
  )
}

export default ProjectCards