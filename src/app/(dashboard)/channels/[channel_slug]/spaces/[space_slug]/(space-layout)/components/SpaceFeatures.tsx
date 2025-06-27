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
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )

  const canViewChat = permissionChecker
    ? permissionChecker.canAccess("chat.view")
    : false
  const canViewPost = permissionChecker
    ? permissionChecker.canAccess("posting.view")
    : false
  const canViewFileSharing = permissionChecker
    ? permissionChecker.canAccess("file_sharing.create")
    : false
  const canViewProject = permissionChecker
    ? permissionChecker.canAccess("project.view")
    : false

  const params = useSearchParams()
  const pageType = params.get("page-type") || null
  const setLayoutStatsVisibility = useSetAtom(spaceStore.layoutStatsVisibility)

  useLayoutEffect(() => {
    if (!pageType) {
      setLayoutStatsVisibility(true)
    }
  }, [])

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

    if (feature.feature_status === 0) {
      return (
        <NoDataCard
          icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
          title="Feature not found"
          description="Feature not available at the moment, or might have been disabled by the admin"
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
            description="Feature not available at the moment, or might have been disabled by the admin"
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

  // Show message if no accessible features
  if (accessibleFeatures.length === 0) {
    return (
      <NoDataCard
        icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
        title="No Features Available"
        description="You don't have permission to access any features in this space, or no features are enabled."
      />
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {accessibleFeatures.length > 1
          ? accessibleFeatures.map(({ feature }) => {
              if (feature?.feature_status === 1) {
                return (
                  <Link
                    key={feature?.id}
                    href={feature ? getFeatureUrl(feature.feature_slug) : "#"}
                  >
                    <Card
                      key={feature?.id}
                      className="h-full flex flex-row items-center py-2 px-4 sm:p-4 gap-4 hover:shadow-md transition-shadow"
                    >
                      <DynamicIcon
                        name={feature?.feature_icon as IconName}
                        className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 "
                      />
                      <div className="flex flex-col overflow-hidden mt-2 sm:mt-0">
                        <CardHeader className="p-0 pb-1">
                          <CardTitle>{feature?.feature_name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 hidden sm:block">
                          <p
                            className="text-sm text-muted-foreground truncate "
                            title={feature?.feature_description ?? undefined}
                          >
                            {feature?.feature_description}
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                )
              } else if (feature?.feature_status === 0) {
                return (
                  <div key={feature?.id} className="cursor-not-allowed">
                    <Card className="h-full flex flex-row items-center py-2 px-4 sm:p-4 gap-4 opacity-60">
                      <DynamicIcon
                        name={feature?.feature_icon as IconName}
                        className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 "
                      />
                      <div className="flex flex-col overflow-hidden mt-2 sm:mt-0">
                        <CardHeader className="p-0 pb-1">
                          <div className="flex items-center justify-between">
                            <CardTitle>{feature?.feature_name}</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <TriangleAlert className="h-4 w-4 text-yellow-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Feature not available at the moment, or
                                    might have been disabled by the admin
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 hidden sm:block">
                          <p
                            className="text-sm text-muted-foreground truncate "
                            title={feature?.feature_description ?? undefined}
                          >
                            {feature?.feature_description}
                          </p>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                )
              }
            })
          : null}
      </div>
      {accessibleFeatures.length === 1
        ? accessibleFeatures.map((sf) => {
            const feature = sf.feature
            if (!feature) return null
            return (
              <div key={feature.id}>
                {renderFeatureModule(feature.feature_slug)}
              </div>
            )
          })
        : null}
    </div>
  )
}

export default SpaceFeatures
