import { SelectTask } from "@/src/db/schema"
import { atom } from "jotai"

const BackLogTasks = atom<SelectTask[]>([])
const selectedTask = atom<SelectTask | null>(null)
const SprintTask = atom<SelectTask[]>([])

export const taskStore = {
  BackLogTasks,
  selectedTask,
  SprintTask
}
