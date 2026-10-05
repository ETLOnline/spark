"use client"
import { SelectSpace, SelectSpaceFeature } from "@/src/db/schema"
import SpacePostComponent from "./SpacePost"
import { redirect, useRouter, useSearchParams } from "next/navigation"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { EarthLock } from "lucide-react"
import FileSharing from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/FileSharing"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import SpaceChat from "./spaceChat"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useServerAction } from "@/src/hooks/useServerAction"
import SpaceOverview from "./SpaceOverview"
import SpaceFYP from "./SpaceFYP"
import { ProjectScreen } from "@/src/components/Dashboard/Projects"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { userStore } from "@/src/store/user/userStore"
import { isEntityUser } from "@/src/utils/clientHelper"
import { GetMyProgramFeedbackAction } from "@/src/server-actions/ProgramFeedback/ProgramFeedback"
import { GetMilestonesForSpaceAction } from "@/src/server-actions/Milestone/Milestone"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"

interface Props {
  features: SelectSpaceFeature[]
  space: SelectSpace
}

function SpaceFeatures({ features, space }: Props) {
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )
  const authUser = useAtomValue(userStore.AuthUser)
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const isSpaceMember = authUser?.unique_id
    ? isEntityUser(space, authUser.unique_id)
    : false

  const params = useSearchParams()
  const pageType = params.get("page-type") || null
  const setLayoutStatsVisibility = useSetAtom(spaceStore.layoutStatsVisibility)

  const router = useRouter()
  const { permissionChecker: globalChecker } = usePermissionChecker("global")
  const canSubmitFeedback =
    (globalChecker?.canAccess("advisory.feedback.submit_advisor") ?? false) ||
    (globalChecker?.canAccess("fyp.feedback.submit_student") ?? false)

  const encodedChannelSlug = encodeURIComponent(
    space.channel?.channel_slug ?? ""
  )
  const encodedSpaceSlug = encodeURIComponent(space.space_slug)

  const [feedbackCheckLoading, setFeedbackCheckLoading] = useState(true)
  const [, , , getMyFeedback] = useServerAction(GetMyProgramFeedbackAction)
  const [, , , getMilestones] = useServerAction(GetMilestonesForSpaceAction)
  // Fires on every fresh page load/refresh, but only once per load — after
  // it redirects, the user can click into any tab (posts, milestones, etc.)
  // without getting bounced back to feedback again. A ref (not
  // sessionStorage) is what gives us that: it resets on an actual refresh
  // (new JS execution) but survives in-app navigation (component stays
  // mounted), which is exactly the "once per visit" behavior we want.
  const hasCheckedFeedbackRedirect = useRef(false)

  // Client-side redirect belongs in an effect, not a render-time call to
  // next/navigation's redirect() — calling that conditionally from a nested
  // client component can desync the App Router's own hook bookkeeping
  // ("Rendered more hooks than during the previous render").
  useEffect(() => {
    // Only the default landing (no explicit tab in the URL) redirects.
    // Someone who explicitly navigated to a tab — fyp/milestones, posts,
    // chat, whatever — should land exactly there, not get bounced to
    // feedback out from under them.
    if (pageType || !space.is_FYP_enable || !canSubmitFeedback) {
      setFeedbackCheckLoading(false)
      return
    }

    if (hasCheckedFeedbackRedirect.current) {
      setFeedbackCheckLoading(false)
      return
    }
    hasCheckedFeedbackRedirect.current = true

    setFeedbackCheckLoading(true)
    Promise.all([getMyFeedback(space.id), getMilestones(space.id)]).then(
      ([feedbackRes, milestonesRes]) => {
        const alreadySubmitted = !!(feedbackRes?.success && feedbackRes.data)
        const milestones = milestonesRes?.success ? milestonesRes.data : []
        const allVerified =
          !!milestones?.length &&
          milestones.every((m) => m.status === MilestoneStatus.VERIFIED)

        if (allVerified && !alreadySubmitted) {
          router.replace(`./${encodedSpaceSlug}/feedback`)
          return
        }
        setFeedbackCheckLoading(false)
      }
    )
  }, [pageType, space.id, space.is_FYP_enable, canSubmitFeedback])

  useLayoutEffect(() => {
    if (!pageType) {
      setLayoutStatsVisibility(true)
    }
  }, [])

  // Show loading state while permission checker is not ready
  if (!permissionChecker) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  const canViewChat = permissionChecker
    ? permissionChecker.canAccess("space.chat.view")
    : false
  const canViewPost = permissionChecker
    ? permissionChecker.canAccess("space.posting.view")
    : false
  const canViewFileSharing = permissionChecker
    ? permissionChecker.canAccess("space.file_sharing.create")
    : false
  const canViewProject = permissionChecker
    ? permissionChecker.canAccess("space.project.view")
    : false

  const hasAnyFeatureAccess =
    canViewChat || canViewPost || canViewFileSharing || canViewProject
  // Function to check if user has permission for a specific feature
  const hasFeaturePermission = (featureSlug: string): boolean => {
    switch (featureSlug) {
      case "posts":
        return canViewPost
      case "file-sharing":
        return canViewFileSharing
      case "project-management":
        return canViewProject
      case "chat":
        return canViewChat
      default:
        return false // Default to no access for unknown features
    }
  }

  // Filter features based on permissions
  const accessibleFeatures = features.filter(({ feature }) => {
    if (!feature) return false
    return hasFeaturePermission(feature.feature_slug)
  })

  const renderFeatureModule = (featureSlug: string) => {
    if (featureSlug === "settings") {
      redirect(`./${encodedSpaceSlug}/settings`)
    } else if (featureSlug === "users") {
      redirect(`./${encodedSpaceSlug}/users`)
    } else if (featureSlug === "feedback") {
      redirect(`./${encodedSpaceSlug}/feedback`)
    } else if (featureSlug === "fyp") {
      if (!space.is_FYP_enable) {
        return (
          <NoDataCard
            icon={
              <EarthLock className="h-16 w-16 text-muted-foreground mb-4" />
            }
            title="Feature not found"
            description="Feature not available at the moment, or might have been disabled by the admin"
          />
        )
      }
      if (!isSpaceMember && !isSuperAdmin) {
        return (
          <NoDataCard
            icon={
              <EarthLock className="h-16 w-16 text-muted-foreground mb-4" />
            }
            title="Access Denied"
            description="Join this Space to access the FYP feature."
          />
        )
      }
      return <SpaceFYP />
    }

    const feature = features.find(
      (sf) => sf.feature?.feature_slug === featureSlug
    )?.feature

    if (!feature) return null

    // Check permission before rendering
    if (!hasFeaturePermission(featureSlug)) {
      return (
        <NoDataCard
          icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
          title="Access Denied"
          description="You don't have permission to access this feature"
        />
      )
    }

    switch (featureSlug) {
      case "posts":
        return <SpacePostComponent />
      case "file-sharing":
        return <FileSharing />
      case "project-management":
        return <ProjectScreen space={space} />
      case "chat":
        return <SpaceChat />
      default:
        return (
          <NoDataCard
            icon={
              <EarthLock className="h-16 w-16 text-muted-foreground mb-4" />
            }
            title="Feature not found"
            description="Feature not available at the moment, or might have been disabled by the admin"
          />
        )
    }
  }

  if (pageType) {
    return <>{renderFeatureModule(pageType)}</>
  }

  if (feedbackCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  return (
    <SpaceOverview
      features={features}
      hasAnyFeatureAccess={hasAnyFeatureAccess}
      space={space}
    />
  )
}

export default SpaceFeatures
