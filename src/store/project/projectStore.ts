import { SelectProject, SelectTask } from "@/src/db/schema";
import { atom } from "jotai";

const projects = atom<SelectProject[]>([])
const selectedProject =  atom<SelectProject>()
const tasks = atom<SelectTask[]>([])
const isCreateItemOpen = atom(false)
const selectedTask = atom<SelectTask | null>(null)

export const projectStore = {
    projects,
    selectedProject,
    tasks,
    isCreateItemOpen,
    selectedTask
}
