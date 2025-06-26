import { InsertTaskStatus, SelectProject, SelectTask } from "@/src/db/schema"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { atom } from "jotai"

const projects = atom<SelectProject[]>([])
const selectedProject = atom<SelectProject>()
const currProject = atom<SelectProject | null>(null)
const projectStatusList = atom<InsertTaskStatus[]>([])
const permissionCheckerAtom = atom<PermissionChecker | null>(null)
const singleprojectPermissionCheckerAtom = atom<PermissionChecker | null>(null)

export const projectStore = {
  projects,
  selectedProject,
  currProject,
  projectStatusList,
  permissionCheckerAtom,
  singleprojectPermissionCheckerAtom
}
