import { SelectChannel } from "@/src/db/schema";
import { atom } from "jotai";

const selectedChannel = atom<SelectChannel | null>(null)
const channelformModalVisibility = atom<boolean>(false)
const channel = atom<SelectChannel[]>([])

export const channelStore = {
  channel,
  selectedChannel,
  channelformModalVisibility,
}