import { Card, CardHeader, CardTitle } from '@/src/components/ui/card'
import { ArrowBigRightDash } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { SelectSpace } from '@/src/db/schema'
import SpaceContextMenu from './spaceContextMenu'

interface Props {
  currentSpace: SelectSpace
}

function SpaceHeader({ currentSpace }: Props) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2 pt-2 flex flex-row items-center justify-between">
        <CardTitle className='flex items-center'>
          <Link href={`/channels/${currentSpace.channel?.channel_slug}/spaces`} >
            <h1 className='text-xl'>
              {currentSpace.channel?.channel_name}
            </h1>
          </Link>
          <ArrowBigRightDash className='mx-2' />
          <Link href={`/channels/${currentSpace.channel?.channel_slug}/spaces/${currentSpace.space_slug}`} >
            <h1 className='text-xl'>
              {currentSpace.space_name}
            </h1>
          </Link>
        </CardTitle>
        <SpaceContextMenu currentSpace={currentSpace} />
      </CardHeader>
    </Card>
  )
}

export default SpaceHeader