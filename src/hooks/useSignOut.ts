import { useClerk } from "@clerk/nextjs"
import { getBeamsClient } from "../services/notifications/BeamClient"
import { useState } from "react"
import { useScreenOverlay } from "./useScreenOverlay"

export function useOnLogout() {
  const { signOut } = useClerk()
  const { showOverlay, hideOverlay } = useScreenOverlay()

  const beamClient = getBeamsClient()

  // clean up
  async function cleanup() {
    await beamClient.clearAllState()
  }

  // manual logout
  async function manualLogout() {
    try {
      showOverlay()
      await cleanup()
      await signOut()
    } finally {
      hideOverlay()
    }
  }

  return { manualLogout }
}
