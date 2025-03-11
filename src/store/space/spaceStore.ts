import { SelectSpace } from "@/src/db/schema"
import { atom } from "jotai"

const spaces = atom<SelectSpace[]>([])
const activeCategory = atom<string>("All")
const selectedSpace = atom<SelectSpace | null>(null)
const spaceFormModelVisibility = atom<boolean>(false)

export const spaceStore = {
  spaces,
  activeCategory,
  selectedSpace,
  spaceFormModelVisibility
}
