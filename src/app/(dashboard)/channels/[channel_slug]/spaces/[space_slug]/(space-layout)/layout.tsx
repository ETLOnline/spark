import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import { GetSpaceBySlugAction } from '@/src/server-actions/Space/Space'
import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import SpacesStats from '@/src/components/Dashboard/Channels/ChannelDetails/Spaces/SpacesStats'
import { ArrowBigRightDash } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
  }>
  children: React.ReactNode
}

async function Layout({ params, children }: Props) {
  const { channel_slug, space_slug } = await params


  const currentSpace = await  GetSpaceBySlugAction(space_slug, channel_slug)

  if (!currentSpace.success || !currentSpace.data) {
    return (
      <NotFound/>
    )
  }


  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex-grow flex justify-center items-start space-x-4">
        <main className="grow space-y-4 post-feed">
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className='flex items-center'>
               
                <Link href={`/channels/${currentSpace.data.channel.channel_slug}/spaces`} >
                  {currentSpace.data.channel.channel_name} 
                </Link>
                <ArrowBigRightDash className='mx-2' /> 
                <Link href={`/channels/${currentSpace.data.channel.channel_slug}/spaces/${currentSpace.data.space_slug}`} >
                  {currentSpace.data.space_name}
                </Link>
                
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{currentSpace.data.description}</p>
            </CardContent>
          </Card>
          <Suspense>
            {children}
          </Suspense>
        </main>
        <SpacesStats />
      </div>
    </div>
  )
}

export default Layout