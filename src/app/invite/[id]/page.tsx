import { ArrowRight, Info, Users } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import InviteScreen from "@/src/components/Invite/InviteScreen"
import { SelectChannel, SelectCommunity, SelectSpace } from "@/src/db/schema"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { GetChannelByIdAction } from "@/src/server-actions/Channel/Channel"
import {
  GetSpaceByIdAction,
  GetSpacesAction
} from "@/src/server-actions/Space/Space"
import { Suspense } from "react"
import { GetCommunityByIdAction } from "@/src/server-actions/Community/Community"

// Mock data - in a real app, you would fetch this based on the invite code

interface Props {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    type: string
  }>
}

export default async function InvitePage({ params, searchParams }: Props) {
  const { id } = await params
  const { type } = await searchParams

  let entity: SelectChannel | SelectSpace | SelectCommunity | null = null

  if (type === "channel") {
    const currentChannel = await GetChannelByIdAction(id, true)
    if (currentChannel.success && currentChannel.data) {
      entity = currentChannel.data as SelectChannel
    }
  }

  if (type === "space") {
    const currentSpace = await GetSpaceByIdAction(id, true)
    if (currentSpace.success && currentSpace.data) {
      entity = currentSpace.data
    }
  }

  if (type === "community") {
    const currentSpace = await GetCommunityByIdAction(id, true)
    if (currentSpace.success && currentSpace.data) {
      entity = currentSpace.data
    }
  }

  if (!entity) {
    return <NotFound />
  }

  return (
    <Suspense>
      <InviteScreen
        entityType={type as "channel" | "space" | "community"}
        entity={entity}
      />
    </Suspense>
  )
}
