import { SelectUser } from "@/src/db/schema"
import { UserPerms } from "@/src/utils/clientHelper"
import { atom } from "jotai"

const Iam = atom<SelectUser | null>(null)
const AuthUser = atom<SelectUser | null>(null)
const Permissions = atom<UserPerms | null>(null)
const SuperAdmin = atom<boolean | false>(false)
const LoadingUser = atom<boolean | null>(true)

export const userStore = {
  Iam,
  AuthUser,
  Permissions,
  SuperAdmin,
  LoadingUser
}
