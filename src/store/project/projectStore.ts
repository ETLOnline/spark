import { SelectProject, SelectTask } from "@/src/db/schema";
import { atom } from "jotai";

const projects = atom<SelectProject[]>([])
const selectedProject =  atom<SelectProject>()
const currPtoject = atom<SelectProject | null>(null)


export const projectStore = {
    projects,
    selectedProject,
    currPtoject
}
