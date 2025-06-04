import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import SprintProgressBar from "./SprintProgressBar"
import SprintStatus from "./SprintStatus"
import BoardColumn from "./BoardColumn"
import { SelectSprint } from "@/src/db/schema"
import { useAtomValue } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"

interface Props {
  sprint: SelectSprint
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

function SprintBoardCard({ sprint }: Props) {
  const projectStatusList = useAtomValue(projectStore.projectStatusList)

  return (
    <Card key={sprint.id} className="mb-6 ">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle>{sprint.title}</CardTitle>
            <CardDescription>
              {new Date(sprint.start_date).toLocaleDateString()} -{" "}
              {new Date(sprint.end_date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Badge>Active</Badge>
          </div>
        </div>

        <SprintProgressBar />
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto ">
          <div className="flex mb-2  w-full">
            {/* <BoardColumn sprint={sprint} status="todo" />
            <BoardColumn sprint={sprint} status="in-progress" />
            <BoardColumn sprint={sprint} status="done" />
            <BoardColumn sprint={sprint} status="in-progress" />
            <BoardColumn sprint={sprint} status="done" /> */}
            {projectStatusList.map((status) => (
              <BoardColumn key={status.id} sprint={sprint} status={status} />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <SprintStatus />
        <Button variant="outline" size="sm">
          Sprint Details
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SprintBoardCard
