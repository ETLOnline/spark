import { useClerk } from "@clerk/nextjs"
import { getBeamsClient } from "../services/notifications/BeamClient"
import { useState } from "react"

export function useOnLogout() {
  const { signOut } = useClerk()
  const [loading, setLoading] = useState(false)

  const beamClient = getBeamsClient()

  // clean up
  async function cleanup() {
    await beamClient.clearAllState()
  }

  // manual logout
  async function manualLogout() {
    try {
      setLoading(true)
      await cleanup()
      await signOut()
    } finally {
      setLoading(false)
    }
  }

  return { manualLogout, loading }
}
