"use client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const ReferralHandler = () => {
  const params = useSearchParams()
  const referralId = params.get("referral_id")

  const decodedId = atob(referralId || "")

  useEffect(() => {
    if (decodedId) {
      localStorage.setItem("referral_id", decodedId)
    }
  }, [decodedId])

  return null
}

export default ReferralHandler
