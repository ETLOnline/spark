import { SelectTask } from "@/src/db/schema"
import { atom } from "jotai"

const BackLogTasks = atom<SelectTask[]>([])
const selectedTask = atom<SelectTask | null>(null)
const selectedSprintTask = atom<SelectTask[]>([])
const shouldRefetchTasks = atom<boolean>(false)
const isTaskModalOpen = atom<boolean>(false)
const isTaskMoveDialogOpen = atom<boolean>(false)
const taskMoveDialogAction = atom<"moveTask" | "endSprint" | "deleteSprint">(
  "moveTask"
)
const isConfirmationAlertOpen = atom<boolean>(false)

export const taskStore = {
  BackLogTasks,
  selectedTask,
  selectedSprintTask,
  shouldRefetchTasks,
  isTaskModalOpen,
  isTaskMoveDialogOpen,
  taskMoveDialogAction,
  isConfirmationAlertOpen
}
