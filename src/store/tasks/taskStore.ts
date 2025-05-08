import { SelectTask } from "@/src/db/schema"
import { atom } from "jotai"

const tasks = atom<SelectTask[]>([])
const isTaskFormModelOpen = atom(false)
const selectedTask = atom<SelectTask | null>(null)

export const taskStore = {
  tasks,
    isTaskFormModelOpen,
    selectedTask,
}