import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { AlertCircle, ArrowRightCircle, CheckCircle2 } from 'lucide-react'
import React, { Dispatch, SetStateAction } from 'react'
import AddSprintTask from './AddSprintTask'
import SprintProgressBar from './SprintProgressBar'
import SprintStatus from './SprintStatus'
import BoardColumn from './BoardColumn'

interface Props {
  sprint: Sprint
  setSprints: Dispatch<SetStateAction<Sprint[]>>
  sprints: Sprint[]
}

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "planning" | "active" | "completed"
  progress: number
  tasks: Task[]
}

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee: {
    name: string
    avatar: string
  }
  storyPoints: number
}


function SprintCard({ sprint, setSprints, sprints }: Props) {
  return (
    <Card key={sprint.id} className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle>{sprint.name}</CardTitle>
            <CardDescription>
              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Badge
              variant={
                sprint.status === "active" ? "default" : sprint.status === "completed" ? "secondary" : "outline"
              }>
              {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
            </Badge>

            <AddSprintTask sprint={sprint} sprints={sprints} setSprints={setSprints} />

          </div>
        </div>

        <SprintProgressBar sprint={sprint} />

      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto ">
          <div className='flex mb-2 gap-2 w-full'>
            <BoardColumn sprint={sprint} status="todo" />
            <BoardColumn sprint={sprint} status="in-progress" />
            <BoardColumn sprint={sprint} status="done" />
            <BoardColumn sprint={sprint} status="in-progress" />
            <BoardColumn sprint={sprint} status="done" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <SprintStatus sprint={sprint} />
        <Button variant="outline" size="sm">
          Sprint Details
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SprintCard