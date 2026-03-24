import { useClerk } from "@clerk/nextjs"
import { getBeamsClient } from "../services/notifications/BeamClient"
import { useState } from "react"
import { useScreenOverlay } from "./useScreenOverlay"

export function useOnLogout() {
  const { signOut } = useClerk()
  const { showOverlay, hideOverlay } = useScreenOverlay()

  const beamClient = getBeamsClient()

  // manual logout
  async function manualLogout() {
    try {
      showOverlay()
      await signOut()
    } finally {
      hideOverlay()
    }
  }

  return { manualLogout }
}
