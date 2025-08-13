import { InsertTaskStatus, SelectProject, SelectTask } from "@/src/db/schema"
import { atom } from "jotai"
import { Channel } from "pusher-js"

const projects = atom<SelectProject[]>([])
const selectedProject = atom<SelectProject>()
const currProject = atom<SelectProject | null>(null)
const projectStatusList = atom<InsertTaskStatus[]>([])
const pusherChannel = atom<Channel | null>(null)

export const projectStore = {
  projects,
  selectedProject,
  currProject,
  projectStatusList,
  pusherChannel
}
