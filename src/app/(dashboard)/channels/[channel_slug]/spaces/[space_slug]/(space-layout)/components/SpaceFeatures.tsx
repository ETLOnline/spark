"use client"
import { SelectSpace, SelectSpaceFeature } from "@/src/db/schema"
import SpacePostComponent from "./SpacePost"
import { redirect, useSearchParams } from "next/navigation"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { EarthLock } from "lucide-react"
import FileSharing from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/FileSharing"
import { useLayoutEffect, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import SpaceChat from "./spaceChat"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import SpaceOverview from "./SpaceOverview"
import SpaceFYP from "./SpaceFYP"
import { ProjectScreen } from "@/src/components/Dashboard/Projects"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { userStore } from "@/src/store/user/userStore"
import { isEntityUser } from "@/src/utils/clientHelper"

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

  const encodedChannelSlug = encodeURIComponent(
    space.channel?.channel_slug ?? ""
  )
  const encodedSpaceSlug = encodeURIComponent(space.space_slug)

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

  return (
    <SpaceOverview
      features={features}
      hasAnyFeatureAccess={hasAnyFeatureAccess}
      space={space}
    />
  )
}

export default SpaceFeatures
