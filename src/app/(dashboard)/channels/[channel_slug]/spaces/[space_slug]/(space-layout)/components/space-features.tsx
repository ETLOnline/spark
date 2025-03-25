
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { SelectSpace, SelectSpaceFeature } from '@/src/db/schema'
import React from 'react'
import SpacePostComponent from './SpacePost'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import NoDataCard from '@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard'
import { EarthLock } from 'lucide-react'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
interface Props {
  features: SelectSpaceFeature[]
  space: SelectSpace
}

function SpaceFeatures({ features, space }: Props) {
  const params = useSearchParams()
  const pageType = params.get('page-type') || null
  const featureList = features.map((sf) => sf.feature?.feature_slug)

  const renderFeatureModule = (featureSlug: string) => {
    const feature = features.find((sf) => sf.feature?.feature_slug === featureSlug)?.feature
    if (!feature) return null

    if (feature.feature_status === 0) {
      <NoDataCard
        icon={<EarthLock className='h-16 w-16 text-muted-foreground mb-4' />}
        title='Feature not found'
        description='Feature not available at the moment, or might have been diabled by the admin'
      />
    }

    if (featureSlug === 'posts') {
      return (
        <SpacePostComponent />
      )
    }

    return (
      <NoDataCard
        icon={<EarthLock className='h-16 w-16 text-muted-foreground mb-4' />}
        title='Feature not found'
        description='Feature not available at the moment, or might have been diabled by the admin'
      />
    )
  }

  if (pageType) {
    return (
      <>{renderFeatureModule(pageType)}</>
    )
  }

  return (
    <div>
      {/* Show only when there are more than 1 feature */}

      <div className='grid grid-cols-3 gap-4'>
        {
          features.length > 1 ? features.map(({ feature }) => {
            return (
              <Link key={feature?.id} href={`./${space.space_slug}?page-type=${feature?.feature_slug}`} >
                <Card key={feature?.id} className="h-full flex flex-row items-center p-4 gap-4">
                  <DynamicIcon
                    name={feature?.feature_icon as IconName}
                    size={30}
                    className="flex-shrink-0"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <CardHeader className="p-0 pb-1">
                      <CardTitle >
                        {feature?.feature_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p
                        className="text-sm text-muted-foreground truncate"
                        title={feature?.feature_description ?? undefined}
                      >
                        {feature?.feature_description}
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )
          }) : null
        }
      </div>
      {
        features.length === 1 ? (
          features.map((sf) => {
            const feature = sf.feature
            if (!feature) return null
            return <>{renderFeatureModule(feature.feature_slug)}</>
          })
        ) : null
      }

    </div >
  )

}

export default SpaceFeatures