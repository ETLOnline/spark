"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { BarChart3, Calendar, CheckCircle2, Clock, ListTodo, Settings, Users } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { SprintManagement } from "./SprintManagement"
import { BacklogManagement } from "./BacklogManagement"
import { FileSharing } from "./FileSharing"
import { ProjectSettings } from "./ProjectSettings"

interface ProjectStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  backlogTasks: number
  currentSprint: string
  sprintProgress: number
  teamMembers: number
  daysLeft: number
}

const projectStats: ProjectStats = {
  totalTasks: 124,
  completedTasks: 78,
  inProgressTasks: 18,
  backlogTasks: 28,
  currentSprint: "Sprint 4",
  sprintProgress: 65,
  teamMembers: 8,
  daysLeft: 6,
}

const recentActivity = [
  {
    id: "1",
    user: "Alex Johnson",
    avatar: "/avatars/01.png",
    action: "completed task",
    item: "Implement user authentication",
    time: "2 hours ago",
  },
  {
    id: "2",
    user: "Sarah Miller",
    avatar: "/avatars/02.png",
    action: "commented on",
    item: "API integration issues",
    time: "4 hours ago",
  },
  {
    id: "3",
    user: "David Chen",
    avatar: "/avatars/03.png",
    action: "uploaded file",
    item: "UI mockups.fig",
    time: "Yesterday",
  },
  {
    id: "4",
    user: "Emma Wilson",
    avatar: "/avatars/04.png",
    action: "moved task",
    item: "Database optimization",
    time: "Yesterday",
  },
  {
    id: "5",
    user: "James Taylor",
    avatar: "/avatars/05.png",
    action: "created task",
    item: "Fix navigation bug",
    time: "2 days ago",
  },
]

export function ProjectDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">E-Commerce Platform</h1>
          <p className="text-muted-foreground">Web application development project</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Timeline
          </Button>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats.totalTasks}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {projectStats.completedTasks} Completed
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Clock className="mr-1 h-3 w-3" />
                    {projectStats.inProgressTasks} In Progress
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Sprint</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats.currentSprint}</div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-xs">
                    <span>{projectStats.sprintProgress}% Complete</span>
                    <span>{projectStats.daysLeft} days left</span>
                  </div>
                  <Progress value={projectStats.sprintProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Backlog</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats.backlogTasks}</div>
                <p className="text-xs text-muted-foreground mt-2">Tasks waiting to be scheduled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats.teamMembers}</div>
                <div className="flex -space-x-2 mt-2">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src="/avatars/01.png" />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src="/avatars/02.png" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src="/avatars/03.png" />
                    <AvatarFallback>DC</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src="/avatars/04.png" />
                    <AvatarFallback>EW</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback>+{projectStats.teamMembers - 4}</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sprint Burndown</CardTitle>
                <CardDescription>Task completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart3 className="h-16 w-16 text-muted" />
                  <span className="ml-2 text-muted">Sprint burndown chart will appear here</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>{activity.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>{" "}
                          <span className="font-medium">{activity.item}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sprints">
          <SprintManagement />
        </TabsContent>

        <TabsContent value="backlog">
          <BacklogManagement />
        </TabsContent>

        <TabsContent value="files">
          <FileSharing />
        </TabsContent>

        <TabsContent value="settings">
          <ProjectSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

