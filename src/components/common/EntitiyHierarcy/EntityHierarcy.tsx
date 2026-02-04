"use client"

import { onlineUsersStore } from "@/src/store/onlineUsers/onlineUsersStore"
import { useEntityHierarchy } from "./useEntityHierarchy"
import { usePresence } from "./usePresence"
import { useSetAtom } from "jotai"
import { useEffect } from "react"

function EntityHierarcy() {
  const setCommunityOnlineUsers = useSetAtom(
    onlineUsersStore.communityOnlineUsers
  )
  const setSpaceOnlineUsers = useSetAtom(onlineUsersStore.spaceOnlineUsers)

  const { hierarchy } = useEntityHierarchy()
  const { communityOnlineUserCount, spaceOnlineUserCount } =
    usePresence(hierarchy)

  useEffect(() => {
    setCommunityOnlineUsers(communityOnlineUserCount || 0)
    setSpaceOnlineUsers(spaceOnlineUserCount || 0)
  }, [communityOnlineUserCount, spaceOnlineUserCount])

  return null
}

export default EntityHierarcy
