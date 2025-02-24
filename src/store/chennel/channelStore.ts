import { atom } from "jotai";

const channelformModalVisibility = atom<boolean>(false)

export const channelStore = {
  channelformModalVisibility,
}