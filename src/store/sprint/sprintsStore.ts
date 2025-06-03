import { SelectSprint } from "@/src/db/schema"
import { atom } from "jotai"

const sprints = atom<SelectSprint[]>([])
const selectedSprint = atom<SelectSprint | null>(null)
const sprintId = atom<string | null>(null)

export const sprintStore = {
  sprints,
  selectedSprint,
  sprintId
}
