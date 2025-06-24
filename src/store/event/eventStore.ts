import { SelectEvent } from "@/src/db/schema"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { atom } from "jotai"

const selectedEvent = atom<SelectEvent | null>(null)
const formModalVisibility = atom<boolean>(false)
const permissionCheckerAtom = atom<PermissionChecker | null>(null)

export const eventStore = {
  selectedEvent,
  formModalVisibility,
  permissionCheckerAtom
}
