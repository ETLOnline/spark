import React, { SetStateAction } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { Textarea } from '../../../ui/textarea';
import { Button } from '../../../ui/button';
import { ProjectDetails } from './ProjectDetailView';

interface Props {
  project: ProjectDetails
  handleAddUpdate: () => void
  newUpdate: string
  setNewUpdate: (value: SetStateAction<string>) => void
}

function MainContent({ project, handleAddUpdate, newUpdate, setNewUpdate }: Props) {
  return (
    <Tabs defaultValue="description">
      <TabsList className='w-full justify-around'>
        <TabsTrigger className='w-1/2' value="description">Description</TabsTrigger>
        <TabsTrigger className='w-1/2' value="updates">Updates</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.description}</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="updates">
        <Card>
          <CardHeader>
            <CardTitle>Project Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.updates.map((update) => (
                <div key={update.id} className="flex space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={update.author.avatar} alt={update.author.name} />
                    <AvatarFallback>{update.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{update.author.name}</p>
                    <p className="text-sm">{update.content}</p>
                    <p className="text-xs text-muted-foreground">{new Date(update.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={(e) => { e.preventDefault(); handleAddUpdate(); }} className="w-full">
              <Textarea
                placeholder="Add a project update..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                className="mb-2"
              />
              <Button type="submit">Post Update</Button>
            </form>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default MainContent