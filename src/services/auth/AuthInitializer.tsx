"use client"
import { useAuthUser } from "@/src/hooks/useAuthUser"

function AuthInitializerClient() {
  useAuthUser()
  return null
}
export default function AuthInitializer() {
  return <AuthInitializerClient />
}
