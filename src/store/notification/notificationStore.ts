import { SelectNotification } from "@/src/db/schema"
import { atom } from "jotai"

const notifications = atom<SelectNotification[]>([])

export const notificationStore = {
  notifications
}
