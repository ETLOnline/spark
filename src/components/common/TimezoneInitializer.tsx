"use client"

import { useEffect } from "react"
import moment from "moment-timezone"

export default function TimezoneInitializer() {
  useEffect(() => {
    moment.tz.setDefault("Asia/Karachi")
  }, [])
  return null
}
