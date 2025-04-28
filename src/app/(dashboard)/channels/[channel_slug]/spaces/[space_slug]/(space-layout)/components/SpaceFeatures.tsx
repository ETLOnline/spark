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
import { EarthLock } from "lucide-react"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import FileSharing from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/FileSharing"
import { useLayoutEffect } from "react"
import SpaceProjects from "./SpaceProjects"
import { useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
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
      <NoDataCard
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
      default:
        return <NoDataCard
          icon={<EarthLock className="h-16 w-16 text-muted-foreground mb-4" />}
          title="Feature not found"
          description="Feature not available at the moment, or might have been diabled by the admin"
        />
    }

  }

  if (pageType) {
    return <>{renderFeatureModule(pageType)}</>
  }

  return (
    <div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.length > 1
          ? features.map(({ feature }) => {
            let featureUrl;
            if (feature?.feature_slug === "project-management") {
              featureUrl = `/project?channel=${space.channel?.channel_slug}&space=${space.space_slug}`
            } else {
              featureUrl = `./${space.space_slug}?page-type=${feature?.feature_slug}`
            }
            return (
              <Link
                key={feature?.id}
                href={featureUrl}
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
