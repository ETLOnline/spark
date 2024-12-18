import { SelectChat } from "@/src/db/schema";
import { atom } from "jotai";


const myChats = atom<SelectChat[]>([])

export const chatStore = {
    myChats
}