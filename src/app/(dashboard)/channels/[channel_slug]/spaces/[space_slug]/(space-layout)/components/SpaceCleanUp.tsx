"use client"

import { useEffect } from "react"
import { useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"

function ClientSpaceCleanup() {
  const setCurrentSpace = useSetAtom(spaceStore.currentSpace)

  useEffect(() => {
    return () => {
      setCurrentSpace(null)
    }
  }, [setCurrentSpace])

  return null
}

export default ClientSpaceCleanup
