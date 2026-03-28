"use client"

import { useState } from "react"
import { OnboardingFlow } from "../TrustEngine/onboarding-flow"
import ProfileCompletionForm from "./ProfileCompletionForm"

export default function ProfileCompletionShell() {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div>
      {!showProfile ? (
        <OnboardingFlow onFinish={() => setShowProfile(true)} />
      ) : (
        <ProfileCompletionForm />
      )}
    </div>
  )
}
