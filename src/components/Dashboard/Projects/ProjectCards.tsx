import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Clock, History, MessageSquare, ThumbsUp, UserPen, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { LinkAsButton } from '../../LinkAsButton/LinkAsButton'
import { ProjectProposal } from '.'
import { SelectProject } from '@/src/db/schema'
import { useSetAtom } from 'jotai'
import { projectStore } from '@/src/store/project/projectStore'
import { Button } from '../../ui/button'



interface Props {
  project: SelectProject
  onEdit: (project: SelectProject) => void
}

function ProjectCards({ project, onEdit }: Props) {
  return (
    <div className='w-full p-2'>
      <Card key={project.id} className="flex flex-col justify-between h-full mb-4">
        <div className='pb-1'>
          <CardHeader className='flex flex-col gap-1'>
            <div className="flex justify-between items-start">
              <div className='flex-grow'>
                <CardTitle className='text-md leading-tight line-clamp-2'>{project.project_name}</CardTitle>
              </div>
              <Badge
                title='Status'
                className='flex-shrink-0 mt-1'
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
            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>
          </CardHeader>
          <CardContent className='pt-1 pb-2'>
            <div className='flex flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1" title='Deadline'>
                  <Clock className="h-4 w-4" />
                  Timeline: <span>{project.project_startDate}</span> - <span>{project.project_targetDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1" title='Deadline'>
                  <History className="h-4 w-4" />
                  Last Update: <span>{project.updated_at}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
        <CardFooter className='pt-4 border-t'>
          <div className='w-full flex flex-col sm:flex-row justify-end gap-2'>
            <LinkAsButton variant="outline" className='w-full sm:w-auto' href={`/project/${project.id}/board`}>
              Launch Board
            </LinkAsButton>
            <LinkAsButton className='w-full sm:w-auto' href={`/project/${project.id}`} >
              View Details
            </LinkAsButton>
            <Button className='w-full sm:w-auto' onClick={() => onEdit(project)}>
              Edit Project
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ProjectCards