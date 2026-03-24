import { atom } from "jotai"

const communityOnlineUsers = atom<number>(0)
const spaceOnlineUsers = atom<number>(0)

export const onlineUsersStore = {
  communityOnlineUsers,
  spaceOnlineUsers
}
