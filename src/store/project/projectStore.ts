import { InsertTaskStatus, SelectProject, SelectTask } from "@/src/db/schema";
import { atom } from "jotai";

const projects = atom<SelectProject[]>([])
const selectedProject =  atom<SelectProject>()
const currProject = atom<SelectProject | null>(null)
const projectStatusList = atom<InsertTaskStatus[]>([])


export const projectStore = {
    projects,
    selectedProject,
    currProject,
    projectStatusList
}
