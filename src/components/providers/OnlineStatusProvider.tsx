"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react"

import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { subscribeToOnlineStatus } from "@/src/utils/onlineStatus"

interface OnlineStatusContextType {
  globalOnlineUsers: Set<string>
  spaceOnlineUsers: Set<string>
  isLoading: boolean
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(
  undefined
)

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const authUser = useAtomValue(userStore.AuthUser)
  const currentSpace = useAtomValue(spaceStore.currentSpace)

  const [globalOnlineUsers, setGlobalOnlineUsers] = useState<Set<string>>(
    new Set()
  )
  const [spaceOnlineUsers, setSpaceOnlineUsers] = useState<Set<string>>(
    new Set()
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authUser) return

    setIsLoading(true)
    const { unsubscribe } = subscribeToOnlineStatus(
      "global",
      undefined,
      (users) => {
        setGlobalOnlineUsers(new Set(users))
        setIsLoading(false)
      }
    )

    return unsubscribe
  }, [authUser])

  useEffect(() => {
    if (!currentSpace) {
      setSpaceOnlineUsers(new Set())
      return
    }

    const { unsubscribe } = subscribeToOnlineStatus(
      "space",
      currentSpace.id.toString(),
      (users) => {
        setSpaceOnlineUsers(new Set(users))
      }
    )

    return unsubscribe
  }, [currentSpace])

  return (
    <OnlineStatusContext.Provider
      value={{
        globalOnlineUsers,
        spaceOnlineUsers,
        isLoading
      }}
    >
      {children}
    </OnlineStatusContext.Provider>
  )
}

export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext)
  if (!context) {
    throw new Error("useOnlineStatus must be used within OnlineStatusProvider")
  }
  return context
}
