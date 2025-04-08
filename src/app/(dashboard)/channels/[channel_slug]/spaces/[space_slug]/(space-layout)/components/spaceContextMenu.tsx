'use client'
import React, { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu'
import { Edit, MoreHorizontal, MoreVertical, Settings, User } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { spaceStore } from '@/src/store/space/spaceStore'
import { SelectSpace } from '@/src/db/schema'
import { useRouter } from 'next/navigation'
import CreateSpaceModal from '@/src/components/Dashboard/Channels/ChannelDetails/Spaces/CreateSpaceModal'
import { channelStore } from '@/src/store/channel/channelStore'

interface Props {
  currentSpace: SelectSpace
}


function SpaceContextMenu({ currentSpace }: Props) {
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] = useState(false)
  const setSelectedSpace = useSetAtom(spaceStore.selectedSpace)
  const channel = useAtomValue(channelStore.selectedChannel)
  const router = useRouter()


  function handleEditSpace(currentSpace: SelectSpace) {
    setSpaceFormModelVisibility(true)
    setSelectedSpace(currentSpace)
  }

  return (
    <>
      <CreateSpaceModal spaceFormModelVisibility={spaceFormModelVisibility} setSpaceFormModelVisibility={setSpaceFormModelVisibility} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`./${currentSpace.space_slug}/settings`)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            handleEditSpace(currentSpace);
          }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`./${currentSpace.space_slug}/users`)}>
            <User className="mr-2 h-4 w-4" />
            Users
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default SpaceContextMenu