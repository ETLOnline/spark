"use client"
import { Avatar, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Calendar, CheckCircle2, Clock, ListTodo, User } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Progress } from "@/src/components/ui/progress"
import RecentActivity from "./RecentActivity"
import ProjectStatCards from "./ProjectStatCards"
import { useAtomValue } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import StatusRequiredDialog from "../StatusRequiredDialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetBacklogTaskCountAction,
  GetSprintTaskCountAction
} from "@/src/server-actions/Tasks/Task"
import { useParams } from "next/navigation"
import Loader from "@/src/components/common/Loader/Loader"
import { getProjectUserCountAndProfileUrlAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { SelectSprint } from "@/src/db/schema"
import { GetSprintAction } from "@/src/server-actions/Sprint/sprint"
import { SelectCurrentSprint } from "./SelectCurrentSprint"
import moment from "moment"
import { SprintBurnDownCard } from "./BurnDown/SprintBurnDownCard"

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
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)
  const [backlogTaskCount, setBacklogTaskCount] = useState(0)
  const [sprintDoneTasksCount, setSprintDoneTasksCount] = useState(0)
  const [sprintInprogressTasksCount, setSprintInprogressTasksCount] =
    useState(0)
  const [totalSprintTasksCount, setTotalSprintTasksCount] = useState(0)
  const [membersCount, setMembersCount] = useState(0)
  const [membersProfileUrl, setMembersProfileUrl] = useState<(string | null)[]>(
    []
  )
  const [sprintList, setSprintList] = useState<SelectSprint[]>([])
  const [activeDropdown, setActiveDropdown] = useState(false)
  const [currentSprint, setCurrentSprint] = useState<SelectSprint | null>(null)
  const [percentage, setPercentage] = useState(0)

  const [GetBacklogTaskCountLoading, , , GetBacklogTaskCount] = useServerAction(
    GetBacklogTaskCountAction
  )
  const [getTeamLoading, , , getTeamUsers] = useServerAction(
    getProjectUserCountAndProfileUrlAction
  )
  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)
  const [getSprintTaskLoading, , , GetSprintTasksCount] = useServerAction(
    GetSprintTaskCountAction
  )

  const params = useParams()

  const GetBacklogTasksCount = async (projectId: string) => {
    try {
      const count = await GetBacklogTaskCount(projectId)
      if (count?.success && count.data) {
        setBacklogTaskCount(count.data)
      }
    } catch (error) {
      console.error("Error fetching backlog task count:", error)
    }
  }

  const getTeamMembers = async (projectId: string) => {
    try {
      const res = await getTeamUsers(projectId, 3, true)
      if (res?.success && res.data) {
        setMembersCount(res.data.totalMembersCount)
        setMembersProfileUrl(res.data.usersProfileUrl)
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
    }
  }

  const fetchSprints = async (projectId: string) => {
    const Sprints = await GetSprints({
      projectId: projectId,
      status: ["active"]
    })
    if (Sprints?.success && Sprints.data) {
      setSprintList(Sprints.data)
      setCurrentSprint(Sprints.data[0])
    }
  }

  function getDaysLeft(endDate: string | Date): number {
    if (!endDate) return 0

    const today = moment()
    const end = moment(endDate)

    const days = end.diff(today, "days")

    return days > 0 ? days : 0
  }

  useEffect(() => {
    if (!params.id) return

    GetBacklogTasksCount(params.id as string)
    getTeamMembers(params.id as string)
    fetchSprints(params.id as string)
  }, [params.id])

  useEffect(() => {
    if (!currentSprint) return

    const fetchSprintTasks = async () => {
      const tasks = await GetSprintTasksCount({
        project_id: params.id as string,
        sprint_id: currentSprint.id,
        done: true,
        inprogress: true
      })
      if (tasks?.success && tasks.data) {
        setSprintDoneTasksCount(tasks.data.DoneTasksCount)
        setSprintInprogressTasksCount(tasks.data.InprogressTasksCount)
        setTotalSprintTasksCount(tasks.data.totalTasksCount)
      }
    }
    fetchSprintTasks()
  }, [currentSprint])

  useEffect(() => {
    let percentage = 0

    if (sprintDoneTasksCount > 0 && totalSprintTasksCount > 0) {
      percentage = Math.round(
        (sprintDoneTasksCount / totalSprintTasksCount) * 100
      )
    }
    setPercentage(percentage)
  }, [sprintDoneTasksCount, totalSprintTasksCount])

  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  return projectStatusList.length > 0 ? (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectStatCards
          title="Current Sprint"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          content={
            <div className="flex flex-col justify-between h-full">
              {getSprintLoading ? (
                <Loader />
              ) : activeDropdown ? (
                <SelectCurrentSprint
                  sprints={sprintList}
                  currentSprint={currentSprint}
                  setCurrentSprint={setCurrentSprint}
                  setActiveDropdown={setActiveDropdown}
                />
              ) : (
                <div
                  onClick={() => setActiveDropdown(true)}
                  className="text-2xl font-bold w-full hover:bg-gray-500 hover:cursor-pointer  flex items-center justify-between px-2 py-1 rounded-md"
                >
                  {currentSprint ? currentSprint.title : "Select Sprint"}
                </div>
              )}
              <div className="mt-2">
                <div className="flex justify-between mb-1 text-xs">
                  <span>{percentage}% Complete</span>
                  <span>
                    {getDaysLeft(currentSprint?.end_date || "")} days left
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            </div>
          }
        />

        <ProjectStatCards
          title="Sprint"
          icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
          content={
            <>
              <div className="text-2xl font-bold">
                {getSprintTaskLoading ? <Loader /> : totalSprintTasksCount}
                <span className="text-xs text-muted-foreground ml-2">
                  Tasks
                </span>
              </div>
              <div className="flex flex-col  gap-2 items-center mt-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-100 w-full justify-center"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {sprintDoneTasksCount} Completed
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-100 w-full justify-center"
                >
                  <Clock className="mr-1 h-3 w-3" />
                  {sprintInprogressTasksCount} In Progress
                </Badge>
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
                {GetBacklogTaskCountLoading ? <Loader /> : backlogTaskCount}
                <span className="text-xs text-muted-foreground ml-2">
                  Tasks
                </span>
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
                {membersCount}
                <span className="text-xs text-muted-foreground ml-2">
                  Members
                </span>
              </div>
              <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                {getTeamLoading ? (
                  <Loader />
                ) : (
                  membersProfileUrl.map((userProfileUrl) => (
                    <Avatar key={userProfileUrl} className="h-8 w-8">
                      <AvatarImage
                        src={userProfileUrl || "https://github.com/shadcn.png"}
                        alt={"user"}
                      />
                    </Avatar>
                  ))
                )}
              </div>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SprintBurnDownCard
            sprintId={currentSprint?.id || ""}
            sprintStart={currentSprint?.start_date || ""}
            sprintEnd={currentSprint?.end_date || ""}
          />
        </div>

        <div className="md:col-span-1">
          <RecentActivity projectId={params.id as string} />
        </div>
      </div>
    </div>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}

export default ProjectOverView
