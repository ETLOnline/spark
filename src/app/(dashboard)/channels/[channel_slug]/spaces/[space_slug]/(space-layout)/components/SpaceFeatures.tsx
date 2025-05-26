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

interface Props {
  features: SelectSpaceFeature[]
  space: SelectSpace
}

function SpaceFeatures({ features, space }: Props) {
  const params = useSearchParams()
  const pageType = params.get("page-type") || null
  const featureList = features.map((sf) => sf.feature?.feature_slug)
  const setLayoutStatsVisibility = useSetAtom(spaceStore.layoutStatsVisibility)

  useLayoutEffect(() => {
    if (!pageType) {
      setLayoutStatsVisibility(true)
    }
  }, [])

  const renderFeatureModule = (featureSlug: string) => {
    const feature = features.find(
      (sf) => sf.feature?.feature_slug === featureSlug
    )?.feature
    if (!feature) return null

    if (feature.feature_status === 0) {
      ;<NoDataCard
        icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
        title="Feature not found"
        description="Feature not available at the moment, or might have been disabled by the admin"
      />
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

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.length > 1
          ? features.map(({ feature }) => {
              if (feature?.feature_status === 1) {
                return (
                  <Link
                    key={feature?.id}
                    href={feature ? getFeatureUrl(feature.feature_slug) : "#"}
                  >
                    <Card
                      key={feature?.id}
                      className="h-full flex flex-row items-center py-2 px-4 sm:p-4 gap-4"
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
                  <Link href={"#"} key={feature?.id}>
                    <Card
                      key={feature?.id}
                      className="h-full flex flex-row items-center py-2 px-4 sm:p-4 gap-4"
                    >
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
                                    might have been diabled by the admin
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
                  </Link>
                )
              }
            })
          : null}
      </div>
      {features.length === 1
        ? features.map((sf) => {
            const feature = sf.feature
            if (!feature) return null
            return <>{renderFeatureModule(feature.feature_slug)}</>
          })
        : null}
    </div>
  )
}

export default SpaceFeatures
