import { SelectProject } from "@/src/db/schema";
import { atom } from "jotai";

const projects = atom<SelectProject[]>([])
const selectedProject =  atom<SelectProject>()

export const projectStore = {
    projects,
    selectedProject
}
