import { SelectChannel } from "@/src/db/schema";
import { atom } from "jotai";

const selectedChannel = atom<SelectChannel | null>(null)
const channelformModalVisibility = atom<boolean>(false)
const channels = atom<SelectChannel[]>([])
const sideBarChannels = atom<SelectChannel[]>([])

export const channelStore = {
  channels,
  selectedChannel,
  channelformModalVisibility,
  sideBarChannels
}