"use client"

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
import { SelectChannel, SelectCommunity, SelectSpace } from "@/src/db/schema"
import {
  isEntityChannel,
  isEntityCommunity,
  isEntitySpace
} from "@/src/utils/helpers"
import { useServerAction } from "@/src/hooks/useServerAction"
import { AttachChannelUserAction } from "@/src/server-actions/Channel/Channel"
import { useActionState, useEffect, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useToast } from "@/src/hooks/use-toast"
import { AttachSpaceUserAction } from "@/src/server-actions/Space/Space"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/src/hooks/useAuthUser"
import { AttachCommunityUserAction } from "@/src/server-actions/Community/Community"
import { isEntityUser } from "@/src/utils/clientHelper"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

interface Props {
  entityType: "channel" | "space" | "community"
  entity: SelectChannel | SelectSpace | SelectCommunity
}

const getEntityRedirectPath = (
  entity: SelectChannel | SelectSpace | SelectCommunity
) => {
  if (isEntityCommunity(entity)) {
    return `/communities/${entity.slug}`
  }
  if (isEntityChannel(entity)) {
    return `/channels/${entity.channel_slug}/spaces`
  }
  if (isEntitySpace(entity)) {
    return `/channels/${entity.channel?.channel_slug}/spaces/${entity.space_slug}`
  }
  return "/"
}

const InviteScreen = ({ entityType, entity }: Props) => {
  const { refreshAuthUser } = useAuthUser()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [navigate, setNavigate] = useState(false)
  const [hasCheckedMembership, setHasCheckedMembership] = useState(false)

  const router = useRouter()
  const authUser = useAtomValue(userStore.AuthUser)
  const { toast } = useToast()

  const isUserMember = isEntityUser(entity, authUser?.unique_id ?? "")

  const entityName = isEntityCommunity(entity)
    ? entity.title
    : isEntityChannel(entity)
      ? entity.channel_name
      : entity.space_name
  const entityDescription = entity.description
  const entityTypeValue = isEntityCommunity(entity)
    ? entity.type
    : isEntityChannel(entity)
      ? entity.channel_type
      : entity.space_type

  const entityUserCount = isEntityCommunity(entity)
    ? (entity?.communityMembers?.length ?? 0)
    : isEntityChannel(entity)
      ? (entity?.users?.length ?? 0)
      : (entity?.users?.length ?? 0)

  const title = `Join ${entityName} ${entityType}`
  const description = `You have been invited to Join the ${entityType} to start collaborating.`

  const [
    loadingCommunityAttach,
    ___,
    errorAttachingCommunity,
    attachCommunityUser
  ] = useServerAction(AttachCommunityUserAction)
  const [loadingChannelAttach, _, errorAttachingChannel, attachChannelUser] =
    useServerAction(AttachChannelUserAction)
  const [loadingSpaceAttach, __, errorAttachingSpace, attachSpaceUser] =
    useServerAction(AttachSpaceUserAction)

  useEffect(() => {
    if (authUser?.unique_id) {
      if (isUserMember) {
        toast({
          title: `You are already a member of this ${entityType}.`,
          variant: "default"
        })
        const path = getEntityRedirectPath(entity)
        router.replace(path)
        
      } else {
        setHasCheckedMembership(true)
      }
    }
  }, [isUserMember, entity, router, authUser])

  useEffect(() => {
    if (navigate) {
      const path = getEntityRedirectPath(entity)
      router.push(path)
    }
  }, [navigate, router, entity])

  const handleJoin = async () => {
    if (isLoading) return
    setIsLoading(true)
    if (authUser?.unique_id && entity.id) {
      try {
        if (isEntityCommunity(entity)) {
          await attachCommunityUser(entity.id, authUser.unique_id)
        }

        if (isEntityChannel(entity)) {
          await attachChannelUser(entity.id, authUser.unique_id)
        }

        if (isEntitySpace(entity)) {
          await attachSpaceUser(entity.id, authUser.unique_id)
        }
        await refreshAuthUser()

        setNavigate(true)
        toast({
          title: `Successfully joined ${entityType}`,
          description: `You have successfully joined the ${entityType}.`,
          variant: "default"
        })
      } catch (err) {
        console.error(`Error joining ${entityType}:`, err)
        toast({
          title: `Error joining ${entityType}`,
          description: `An error occurred while trying to join the ${entityType}.`,
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }
  }

  if (!hasCheckedMembership || isUserMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarFallback className="text-2xl">
                {entityName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              </div>
              <div>
                <p className="text-sm font-medium">About this {entityType}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {entityDescription}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {entityUserCount} members
                  </div>

                  <Badge variant="secondary" className="text-xs">
                    {entityTypeValue}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            loading={isLoading}
            disabled={isLoading}
            className="w-full sm:w-auto"
            onClick={handleJoin}
          >
            {isLoading ? "Joining..." : "Continue to Join"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default InviteScreen
