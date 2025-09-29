import { useClerk } from "@clerk/nextjs"
import { getBeamsClient } from "../services/notifications/BeamClient"

export function useOnLogout() {
  const { signOut } = useClerk()

  const beamClient = getBeamsClient()

  // clean up
  async function cleanup() {
    await beamClient.clearAllState()
  }

  // manual logout
  async function manualLogout() {
    await cleanup()
    await signOut()
  }

  return { manualLogout }
}
