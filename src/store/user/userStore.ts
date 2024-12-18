
import { SelectUser } from '@/src/db/schema'
import { atom } from 'jotai'


const Iam = atom<SelectUser | null>(null)
const user = atom<SelectUser | null>(null)

export const userStore = {
    Iam,
    user
}

