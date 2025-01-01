import { SelectChat, SelectUserChat } from "@/src/db/schema";
import { atom } from "jotai";


const myChats = atom<SelectChat[]>([])
const currentChat = atom<SelectChat | null>(null)
const switchedChat = atom<SelectChat | null>(null)

export const chatStore = {
    myChats,
    currentChat,
    switchedChat
}