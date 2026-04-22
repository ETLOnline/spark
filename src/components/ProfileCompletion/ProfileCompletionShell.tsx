"use client"

import { useEffect, useState } from "react"
import { OnboardingFlow } from "../TrustEngine/onboarding-flow"
import ProfileCompletionForm from "./ProfileCompletionForm"
import { getFeatureFlagAction } from "@/src/server-actions/FeatureFlag/FeatureFlag"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../common/Loader/Loader"
import { LoaderSizes } from "../common/types/loader-types"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getNextProfileCompletionStep } from "@/src/utils/clientHelper"

export default function ProfileCompletionShell() {
  const [showProfile, setShowProfile] = useState(false)
  const [resumeStep, setResumeStep] = useState(1)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isTrustEngineEnabled, setIsTrustEngineEnabled] = useState(false)

  const [isTrustEngineLoading, , , GetFeatureFlag] =
    useServerAction(getFeatureFlagAction)
  const [isAuthUserLoading, , , GetAuthUser] = useServerAction(AuthUserAction)

  useEffect(() => {
    const initializeFlowState = async () => {
      const [featureFlagRes, authUser] = await Promise.all([
        GetFeatureFlag(["Trust_Engine_Enabled"]),
        GetAuthUser()
      ])

      if (featureFlagRes?.success && featureFlagRes?.data?.is_enabled) {
        setIsTrustEngineEnabled(true)
      }

      const nextStep = getNextProfileCompletionStep(authUser?.profile)
      setResumeStep(nextStep)

      if (nextStep > 1) {
        setShowProfile(true)
      }

      setIsInitializing(false)
    }

    initializeFlowState()
  }, [])

  return (
    <div>
      {isInitializing || isTrustEngineLoading || isAuthUserLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size={LoaderSizes.lg} />
        </div>
      ) : isTrustEngineEnabled && !showProfile ? (
        <OnboardingFlow onFinish={() => setShowProfile(true)} />
      ) : (
        <ProfileCompletionForm initialStep={resumeStep} />
      )}
    </div>
  )
}
