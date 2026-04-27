"use client"

import { useEffect, useState } from "react"
import { OnboardingFlow } from "../TrustEngine/onboarding-flow"
import ProfileCompletionForm from "./ProfileCompletionForm"
import { getFeatureFlagAction } from "@/src/server-actions/FeatureFlag/FeatureFlag"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../common/Loader/Loader"
import { LoaderSizes } from "../common/types/loader-types"
import { SelectUser } from "@/src/db/schema"

interface ProfileCompletionShellProps {
  initialUser: SelectUser
}

export default function ProfileCompletionShell({
  initialUser
}: ProfileCompletionShellProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [isTrustEngineEnabled, setIsTrustEngineEnabled] = useState(false)

  const [isTrustEngineLoading, , , GetFeatureFlag] =
    useServerAction(getFeatureFlagAction)

  async function getFetureFlag() {
    const res = await GetFeatureFlag(["Trust_Engine_Enabled"])
    if (res?.success && res?.data?.is_enabled) {
      setIsTrustEngineEnabled(true)
    }
  }
  useEffect(() => {
    getFetureFlag()
  }, [])

  return (
    <div>
      {isTrustEngineLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size={LoaderSizes.lg} />
        </div>
      ) : isTrustEngineEnabled && !showProfile ? (
        <OnboardingFlow onFinish={() => setShowProfile(true)} />
      ) : (
        <ProfileCompletionForm
          isTrustEngineEnabled={isTrustEngineEnabled}
          initialUser={initialUser}
        />
      )}
    </div>
  )
}
