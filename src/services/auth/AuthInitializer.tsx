"use client"
import { useEffect } from "react"
import moment from "moment-timezone"
import { useAuthUser } from "@/src/hooks/useAuthUser"

function AuthInitializerClient() {
  useAuthUser()
  useEffect(() => {
    moment.tz.setDefault("Asia/Karachi")
  }, [])
  return null
}
export default function AuthInitializer() {
  return <AuthInitializerClient />
}
