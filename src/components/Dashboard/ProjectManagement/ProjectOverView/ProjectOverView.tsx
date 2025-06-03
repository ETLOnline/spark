import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Calendar, CheckCircle2, Clock, ListTodo, User } from "lucide-react"
import React from "react"
import { Progress } from "@/src/components/ui/progress"
import RecentActivity from "./RecentActivity"
import ProjectSprintBurnDown from "./ProjectSprintBurnDown"
import ProjectStatCards from "./ProjectStatCards"

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
  daysLeft: 6
}

function ProjectOverView() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectStatCards
          title="Total Tasks"
          icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
          content={
            <>
              <div className="text-2xl font-bold">
                {projectStats.totalTasks}
              </div>
              <div className="flex flex-col  gap-2 items-center mt-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-100 w-full justify-center"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {projectStats.completedTasks} Completed
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100 w-full justify-center"
                >
                  <Clock className="mr-1 h-3 w-3" />
                  {projectStats.inProgressTasks} In Progress
                </Badge>
              </div>
            </>
          }
        />

        <ProjectStatCards
          title="Current Sprint"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          content={
            <>
              <div className="text-2xl font-bold">
                {projectStats.currentSprint}
              </div>
              <div className="mt-2">
                <div className="flex justify-between mb-1 text-xs">
                  <span>{projectStats.sprintProgress}% Complete</span>
                  <span>{projectStats.daysLeft} days left</span>
                </div>
                <Progress value={projectStats.sprintProgress} className="h-2" />
              </div>
            </>
          }
        />

        <ProjectStatCards
          title="Backlog"
          icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
          content={
            <>
              <div className="text-2xl font-bold">
                {projectStats.backlogTasks}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tasks waiting to be scheduled
              </p>
            </>
          }
        />

        <ProjectStatCards
          title="Team"
          icon={<User className="h-4 w-4 text-muted-foreground" />}
          content={
            <>
              <div className="text-2xl font-bold">
                {projectStats.teamMembers}
              </div>
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
                  <AvatarFallback>
                    +{projectStats.teamMembers - 4}
                  </AvatarFallback>
                </Avatar>
              </div>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProjectSprintBurnDown />

        <RecentActivity />
      </div>
    </div>
  )
}

export default ProjectOverView
