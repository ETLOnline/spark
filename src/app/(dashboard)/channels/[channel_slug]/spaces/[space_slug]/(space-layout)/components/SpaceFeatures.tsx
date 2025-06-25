"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { SelectSpace, SelectSpaceFeature } from "@/src/db/schema"
import SpacePostComponent from "./SpacePost"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { EarthLock, TriangleAlert } from "lucide-react"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import FileSharing from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/FileSharing"
import { useLayoutEffect } from "react"
import SpaceProjects from "./SpaceProjects"
import { useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import SpaceChat from "./spaceChat"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface Props {
  features: SelectSpaceFeature[]
  space: SelectSpace
}

function SpaceFeatures({ features, space }: Props) {
  const { permissionChecker, canAccess } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )

  const canViewChat = canAccess("chat.view")
  const canViewPost = canAccess("posting.view")
  const canViewFileSharing = canAccess("file_sharing.create")
  const canViewProject = canAccess("project.view")

  const params = useSearchParams()
  const pageType = params.get("page-type") || null
  const setLayoutStatsVisibility = useSetAtom(spaceStore.layoutStatsVisibility)

  useLayoutEffect(() => {
    if (!pageType) {
      setLayoutStatsVisibility(true)
    } else {
      setLayoutStatsVisibility(false)
    }
  }, [pageType, setLayoutStatsVisibility])

  const renderFeatureModule = (featureSlug: string) => {
    const feature = features.find(
      (sf) => sf.feature?.feature_slug === featureSlug
    )?.feature

    let hasPermission = false
    switch (featureSlug) {
      case "posts":
        hasPermission = canViewPost === true
        break
      case "file-sharing":
        hasPermission = canViewFileSharing === true
        break
      case "project-management":
        hasPermission = canViewProject === true
        break
      case "chat":
        hasPermission = canViewChat === true
        break
      default:
        hasPermission = false
    }

    if (!hasPermission) {
      return (
        <NoDataCard
          icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
          title="Access Denied"
          description="You do not have permission to view this feature."
        />
      )
    }

    if (!feature) {
      return (
        <NoDataCard
          icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
          title="Feature Not Found"
          description="The requested feature could not be found."
        />
      )
    }

    if (feature.feature_status === 0) {
      return (
        <NoDataCard
          icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
          title="Feature Disabled"
          description="This feature is currently disabled by the admin."
        />
      )
    }

    switch (featureSlug) {
      case "posts":
        return <SpacePostComponent />
      case "file-sharing":
        return <FileSharing />
      case "project-management":
        return <SpaceProjects />
      case "chat":
        return <SpaceChat />
      default:
        return (
          <NoDataCard
            icon={
              <EarthLock className="h-16 w-16 text-muted-foreground mb-4" />
            }
            title="Feature not found"
            description="Feature not available at the moment, or might have been diabled by the admin"
          />
        )
    }
  }

  if (pageType) {
    return <>{renderFeatureModule(pageType)}</>
  }

  function getFeatureUrl(feature_slug: string) {
    if (feature_slug === "project-management") {
      return `/project?channel=${space.channel?.channel_slug}&space=${space.space_slug}`
    } else {
      return `./${space.space_slug}?page-type=${feature_slug}`
    }
  }

  // Filter features to include only those that are enabled AND the user has permission to view.
  const visibleAndEnabledFeatures = features.filter((sf) => {
    const feature = sf.feature
    if (!feature) return false // Exclude if feature object is missing

    let hasPermissionForCard = false
    switch (feature.feature_slug) {
      case "posts":
        hasPermissionForCard = canViewPost === true
        break
      case "file-sharing":
        hasPermissionForCard = canViewFileSharing === true
        break
      case "project-management":
        hasPermissionForCard = canViewProject === true
        break
      case "chat":
        hasPermissionForCard = canViewChat === true
        break
      default:
        hasPermissionForCard = false
    }
    // Only include features that are both permitted AND enabled
    return hasPermissionForCard && feature.feature_status === 1
  })

  // Filter features to include all features user has permission to view, regardless of status
  const permittedFeatures = features.filter((sf) => {
    const feature = sf.feature
    if (!feature) return false

    let hasPermissionForCard = false
    switch (feature.feature_slug) {
      case "posts":
        hasPermissionForCard = canViewPost === true
        break
      case "file-sharing":
        hasPermissionForCard = canViewFileSharing === true
        break
      case "project-management":
        hasPermissionForCard = canViewProject === true
        break
      case "chat":
        hasPermissionForCard = canViewChat === true
        break
      default:
        hasPermissionForCard = false
    }
    return hasPermissionForCard
  })

  return (
    <div>
      {/* Conditionally render NoDataCard if no visible AND enabled features */}
      {visibleAndEnabledFeatures.length === 0 ? (
        <NoDataCard
          icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
          title="No Available Features"
          description="There are no active features available for you to view in this space based on your permissions."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Map over features that are at least permitted (enabled or disabled) */}
          {permittedFeatures.map((sf) => {
            const feature = sf.feature! // Non-null assertion is safe due to filter

            const commonCardProps = {
              className:
                "h-full flex flex-row items-center py-2 px-4 sm:p-4 gap-4"
            }

            const iconComponent = (
              <DynamicIcon
                name={feature.feature_icon as IconName}
                className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8"
              />
            )

            const cardContent = (
              <div className="flex flex-col overflow-hidden mt-2 sm:mt-0">
                <CardHeader className="p-0 pb-1">
                  <CardTitle>{feature.feature_name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 hidden sm:block">
                  <p
                    className="text-sm text-muted-foreground truncate"
                    title={feature.feature_description ?? undefined}
                  >
                    {feature.feature_description}
                  </p>
                </CardContent>
              </div>
            )

            if (feature.feature_status === 1) {
              // Render enabled feature card with a functional link
              return (
                <Link
                  key={feature.id}
                  href={getFeatureUrl(feature.feature_slug)}
                >
                  <Card {...commonCardProps}>
                    {iconComponent}
                    {cardContent}
                  </Card>
                </Link>
              )
            } else {
              // Render disabled feature card with a non-functional link and a tooltip
              // This branch is only reached if feature.feature_status is 0 and the user has permission
              return (
                <Link key={feature.id} href={"#"}>
                  <Card {...commonCardProps}>
                    {iconComponent}
                    <div className="flex flex-col overflow-hidden mt-2 sm:mt-0">
                      <CardHeader className="p-0 pb-1">
                        <div className="flex items-center justify-between">
                          <CardTitle>{feature.feature_name}</CardTitle>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <TriangleAlert className="h-4 w-4 text-yellow-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Feature not available at the moment, or might
                                  have been disabled by the admin.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 hidden sm:block">
                        <p
                          className="text-sm text-muted-foreground truncate"
                          title={feature.feature_description ?? undefined}
                        >
                          {feature.feature_description}
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              )
            }
          })}
        </div>
      )}
    </div>
  )
}

export default SpaceFeatures
