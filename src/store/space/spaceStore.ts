import { SelectSpace } from "@/src/db/schema"
import { atom } from "jotai"

const spaces = atom<SelectSpace[]>([])
const activeCategory = atom<string>("All")

export const spaceStore = {
  spaces,
  activeCategory
}
