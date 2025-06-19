import { SelectChat } from "@/src/db/schema"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { atom } from "jotai"

const myChats = atom<SelectChat[]>([])
const currentChat = atom<SelectChat | null>(null)
const switchedChat = atom<SelectChat | null>(null)
const isMobileMenuOpen = atom<boolean>(false)
const permissionCheckerAtom = atom<PermissionChecker | null>(null)

export const chatStore = {
  myChats,
  currentChat,
  switchedChat,
  isMobileMenuOpen,
  permissionCheckerAtom
}
