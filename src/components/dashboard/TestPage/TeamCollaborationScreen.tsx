'use client'

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Calendar, CheckSquare, FileText, MessageSquare, Plus, Video } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: "To Do" | "In Progress" | "Done"
  assignee: {
    name: string
    avatar: string
  }
  dueDate: string
}

interface Document {
  id: string
  title: string
  type: "doc" | "spreadsheet" | "presentation"
  lastModified: string
  modifiedBy: {
    name: string
    avatar: string
  }
}

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees: {
    name: string
    avatar: string
  }[]
}

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Design user interface for new feature",
    description: "Create wireframes and mockups for the upcoming feature.",
    status: "In Progress",
    assignee: { name: "Alice Johnson", avatar: "/avatars/01.png" },
    dueDate: "2023-05-20",
  },
  {
    id: "2",
    title: "Implement API endpoints",
    description: "Develop and test new API endpoints for the backend.",
    status: "To Do",
    assignee: { name: "Bob Smith", avatar: "/avatars/02.png" },
    dueDate: "2023-05-25",
  },
  {
    id: "3",
    title: "Write documentation for v2.0 release",
    description: "Prepare comprehensive documentation for the upcoming release.",
    status: "Done",
    assignee: { name: "Charlie Davis", avatar: "/avatars/03.png" },
    dueDate: "2023-05-15",
  },
]

const sampleDocuments: Document[] = [
  {
    id: "1",
    title: "Project Roadmap",
    type: "spreadsheet",
    lastModified: "2023-05-10T14:30:00Z",
    modifiedBy: { name: "Alice Johnson", avatar: "/avatars/01.png" },
  },
  {
    id: "2",
    title: "Meeting Notes - May 12",
    type: "doc",
    lastModified: "2023-05-12T11:15:00Z",
    modifiedBy: { name: "Bob Smith", avatar: "/avatars/02.png" },
  },
  {
    id: "3",
    title: "Q2 Presentation",
    type: "presentation",
    lastModified: "2023-05-14T09:45:00Z",
    modifiedBy: { name: "Charlie Davis", avatar: "/avatars/03.png" },
  },
]

const sampleMeetings: Meeting[] = [
  {
    id: "1",
    title: "Weekly Team Sync",
    date: "2023-05-18",
    time: "10:00 AM",
    attendees: [
      { name: "Alice Johnson", avatar: "/avatars/01.png" },
      { name: "Bob Smith", avatar: "/avatars/02.png" },
      { name: "Charlie Davis", avatar: "/avatars/03.png" },
    ],
  },
  {
    id: "2",
    title: "Project Review",
    date: "2023-05-20",
    time: "2:00 PM",
    attendees: [
      { name: "Alice Johnson", avatar: "/avatars/01.png" },
      { name: "Charlie Davis", avatar: "/avatars/03.png" },
    ],
  },
]

export function TeamCollaborationScreen() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="h-full flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Team Collaboration</CardTitle>
          <CardDescription>Manage tasks, documents, and meetings for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              placeholder="Search tasks, documents, or meetings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="flex-1">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4">
              {sampleTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={task.status === "To Do" ? "outline" : task.status === "In Progress" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                        <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Update Status
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="documents" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4">
              {sampleDocuments.map((document) => (
                <Card key={document.id}>
                  <CardHeader>
                    <CardTitle>{document.title}</CardTitle>
                    <CardDescription>
                      Last modified on {new Date(document.lastModified).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {document.type === "doc" && "Document"}
                        {document.type === "spreadsheet" && "Spreadsheet"}
                        {document.type === "presentation" && "Presentation"}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={document.modifiedBy.avatar} alt={document.modifiedBy.name} />
                          <AvatarFallback>{document.modifiedBy.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{document.modifiedBy.name}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Open Document
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="meetings" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4">
              {sampleMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle>{meeting.title}</CardTitle>
                    <CardDescription>
                      {meeting.date} at {meeting.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{meeting.date}</span>
                      <span className="text-sm">{meeting.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Attendees:</span>
                      <div className="flex -space-x-2">
                        {meeting.attendees.map((attendee, index) => (
                          <Avatar key={index} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={attendee.avatar} alt={attendee.name} />
                            <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Video className="mr-2 h-4 w-4" />
                      Join Meeting
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              New Document
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

