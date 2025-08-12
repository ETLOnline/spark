import { atom } from "jotai"

const pageNameAtom = atom<string | null>(null)

export const siteStore = {
  pageNameAtom
}
