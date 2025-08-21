import { useAtomValue } from "jotai"
import { hostStore } from "../store/host/hostStore" // Adjust path as needed
import { SelectUser } from "@/src/db/schema" // Assuming SelectUser is defined here

interface HostUserInfoResult {
  loading: boolean
  error: Error | null
  full_name?: string
  email?: string
  host_id?: string
}

export function useHostUserInfo(host_id?: string): HostUserInfoResult {
  const hosts = useAtomValue(hostStore.hosts)

  if (!host_id) {
    return {
      loading: false,
      error: new Error("Host ID is required to fetch user info.")
    }
  }

  const hostData = hosts[host_id]

  if (!hostData) {
    return {
      loading: false,
      error: new Error(`Host with ID "${host_id}" not found in store.`)
    }
  }

  return {
    loading: false,
    error: null,
    full_name: `${hostData.first_name} ${hostData.last_name}`,
    email: hostData.email,
    host_id: hostData.unique_id
  }
}
