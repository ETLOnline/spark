import { SelectSpace } from "@/src/db/schema"
import { atom } from "jotai"

const spaces = atom<SelectSpace[]>([])
const activeCategory = atom<string>("All")
const spaceFormModelVisibility = atom<boolean>(false)
const selectedSpace = atom<SelectSpace | null>(null)

export const spaceStore = {
  spaces,
  activeCategory,
  spaceFormModelVisibility,
  selectedSpace
}
