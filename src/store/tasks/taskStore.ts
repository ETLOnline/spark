import { SelectTask } from "@/src/db/schema"
import { atom } from "jotai"

const tasks = atom<SelectTask[]>([])
const selectedTask = atom<SelectTask | null>(null)
const SprintTask = atom<SelectTask[]>([])

export const taskStore = {
  tasks,

  selectedTask,
  SprintTask
}
