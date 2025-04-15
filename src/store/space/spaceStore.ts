import { DirItem } from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/types/spaces-types"
import { SelectSpace } from "@/src/db/schema"
import { atom } from "jotai"

const spaces = atom<SelectSpace[]>([])
const activeCategory = atom<string>("All")
const spaceFormModelVisibility = atom<boolean>(false)
const selectedSpace = atom<SelectSpace | null>(null)
const dir = atom<DirItem[]>([])
const currDirPath = atom<string>("/")
const layoutStatsVisibility = atom<boolean>(true)
const selectedChannelSpaces = atom<SelectSpace[]>([])

export const spaceStore = {
  spaces,
  activeCategory,
  spaceFormModelVisibility,
  selectedSpace,
  dir,
  currDirPath,
  layoutStatsVisibility,
  selectedChannelSpaces
}
