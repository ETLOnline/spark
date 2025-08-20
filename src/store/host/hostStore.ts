import { SelectUser } from "@/src/db/schema"
import { atom } from "jotai"

const hosts = atom<Record<string, SelectUser>>({})

export const hostStore = {
  hosts
}
