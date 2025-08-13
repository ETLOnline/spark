import { SelectSprint } from "@/src/db/schema"
import pusherClient from "@/src/services/realtime/PusherClient"
import { atom } from "jotai"
import { Channel } from "pusher-js"

const sprints = atom<SelectSprint[]>([])
const selectedSprint = atom<SelectSprint | null>(null)
const sprintId = atom<string | null>(null)
const pusherChannel = atom<Channel | null>(null)

export const sprintStore = {
  sprints,
  selectedSprint,
  sprintId,
  pusherChannel
}
