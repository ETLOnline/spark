import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { MessageSquare, ThumbsUp, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { LinkAsButton } from '../../LinkAsButton/LinkAsButton'
import { ProjectProposal } from '.'
import { SelectProject } from '@/src/db/schema'
import { useSetAtom } from 'jotai'
import { projectStore } from '@/src/store/project/projectStore'



interface Props {
  project: SelectProject
}

function ProjectCards({ project }: Props) {
  return (
    <Card key={project.id} className="mb-4">
      <CardHeader >
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.project_name}</CardTitle>
            {/* <CardDescription>{project.category}</CardDescription> */}
          </div>
          <Badge
            variant={
              project.project_type === "active"
                ? "default"
                : project.project_type === "draft"
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
        {/* <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <ThumbsUp className="mr-1 h-4 w-4" />
            {project.likes}
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            {project.comments}
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            {project.contributors}
          </div>
        </div> */}
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
    </Card>
  )
}

export default ProjectCards