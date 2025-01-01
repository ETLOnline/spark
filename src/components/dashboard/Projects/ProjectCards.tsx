import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { MessageSquare, ThumbsUp, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { LinkAsButton } from '../../LinkAsButton/LinkAsButton'
import { ProjectProposal } from '.'



interface Props {
  proposal: ProjectProposal
}

function ProjectCards({ proposal }: Props) {
  return (
    <Card key={proposal.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription>{proposal.category}</CardDescription>
          </div>
          <Badge
            variant={
              proposal.status === "active"
                ? "default"
                : proposal.status === "completed"
                  ? "secondary"
                  : "outline"
            }
          >
            {proposal.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {proposal.description}
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <ThumbsUp className="mr-1 h-4 w-4" />
            {proposal.likes}
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            {proposal.comments}
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            {proposal.contributors}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={proposal.author.avatar}
              alt={proposal.author.name}
            />
            <AvatarFallback>
              {proposal.author.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {proposal.author.name}
          </span>
        </div>
        <LinkAsButton href="/project-incubator/detail">
          View Details
        </LinkAsButton>
      </CardFooter>
    </Card>
  )
}

export default ProjectCards