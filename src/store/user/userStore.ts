import { SelectUser, SelectPersona } from "@/src/db/schema"
import { atom } from "jotai"

const Iam = atom<SelectUser | null>(null)
const AuthUser = atom<SelectUser | null>(null)
const Persona = atom<SelectPersona | null>(null)

export const userStore = {
  Iam,
  AuthUser,
  Persona
}
