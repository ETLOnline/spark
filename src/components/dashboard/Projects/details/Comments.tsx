import React, { SetStateAction } from 'react'
import { ScrollArea } from '../../../ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar'
import { Textarea } from '../../../ui/textarea'
import { Button } from '../../../ui/button'
import { ProjectDetails } from './ProjectDetailView'

interface Props {
  project: ProjectDetails
  newComment: string
  setNewComment: (value: SetStateAction<string>) => void
  handleAddComment: () => void
}

function Comments({ project, newComment, setNewComment, handleAddComment }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      <ScrollArea>
        <div className="space-y-4">
          {project.comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">{comment.author.name}</CardTitle>
                    <CardDescription className="text-xs">{new Date(comment.createdAt).toLocaleString()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-4">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleAddComment}>Post Comment</Button>
      </div>
    </div>
  )
}

export default Comments