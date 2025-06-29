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
import { SelectChannel, SelectSpace } from "@/src/db/schema"
import { isEntityChannel, isEntitySpace } from "@/src/utils/helpers"
import { useServerAction } from "@/src/hooks/useServerAction"
import { AttachChannelUserAction } from "@/src/server-actions/Channel/Channel"
import { useActionState, useEffect, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useToast } from "@/src/hooks/use-toast"
import { AttachSpaceUserAction } from "@/src/server-actions/Space/Space"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/src/hooks/useAuthUser"

interface Props {
  entityType: "channel" | "space"
  entity: SelectChannel | SelectSpace
}

const InviteScreen = ({ entityType, entity }: Props) => {
  const { refreshAuthUser, isReloadingPermissions } = useAuthUser()
  const entityName = isEntityChannel(entity)
    ? entity.channel_name
    : entity.space_name
  const entityDescription = entity.description
  const entityTypeValue = isEntityChannel(entity)
    ? entity.channel_type
    : entity.space_type

  const title = `Join ${entityName} ${entityType}`
  const description = `You have been invited to Join the ${entityType} to start collaborating.`

  const { toast } = useToast()
  const router = useRouter()
  const authUser = useAtomValue(userStore.AuthUser)
  const [loadingChannelAttach, _, errorAttachingChannel, attachChannelUser] =
    useServerAction(AttachChannelUserAction)
  const [loadingSpaceAttach, __, errorAttachingSpace, attachSpaceUser] =
    useServerAction(AttachSpaceUserAction)

  const [navigate, setNavigate] = useState(false)

  useEffect(() => {
    if (navigate) {
      if (isEntityChannel(entity)) {
        router.push(
          `/channels/${isEntityChannel(entity) ? entity.channel_slug : ""}/spaces`
        )
      } else {
        router.push(
          `/channels/${entity.channel?.channel_slug}/spaces/${isEntitySpace(entity) ? entity.space_slug : ""}`
        )
      }
    }
  }, [navigate])

  const handleJoin = async () => {
    if (authUser?.unique_id && entity.id) {
      try {
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
      }
    }
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
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">About this {entityType}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {entityDescription}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />0 members
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
            loading={loadingChannelAttach || loadingSpaceAttach}
            disabled={loadingChannelAttach || loadingSpaceAttach}
            className="w-full sm:w-auto"
            onClick={handleJoin}
          >
            Continue to Join
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default InviteScreen
