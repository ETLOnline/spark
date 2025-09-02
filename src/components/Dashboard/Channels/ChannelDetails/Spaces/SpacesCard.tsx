import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { SelectSpace } from "@/src/db/schema"
import SpacesActionButtons from "./SpaceActionButtons"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue } from "jotai"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  ArrowRight,
  Check,
  Lock,
  LogOut,
  PencilRuler,
  PlusCircle
} from "lucide-react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { AttachSpaceUserAction } from "@/src/server-actions/Space/Space"
import { LeaveSpaceAction } from "@/src/server-actions/Space/SpaceActions"
import { useToast } from "@/src/hooks/use-toast"
import { isEntityUser } from "@/src/utils/clientHelper"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { useEffect, useState } from "react"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface Props {
  space: SelectSpace
  setIsChannelMember?: React.Dispatch<React.SetStateAction<boolean>>
}

function SpacesCard({ space, setIsChannelMember }: Props) {
  const router = useRouter()
  const user = useAtomValue(userStore.AuthUser)
  const currentUserId = user?.unique_id
  const { toast } = useToast()
  const [isSpaceMember, setIsSpaceMember] = useState<boolean>(false)
  const encodedSpaceSlug = encodeURIComponent(space.space_slug)

  const [joinLoading, joinResult, joinError, joinSpace] = useServerAction(
    AttachSpaceUserAction
  )
  const [leaveLoading, leaveResult, leaveError, leaveSpace] =
    useServerAction(LeaveSpaceAction)

  useEffect(() => {
    if (space && currentUserId) {
      const isMember = isEntityUser(space, currentUserId)
      setIsSpaceMember(isMember)
    }
  }, [space, currentUserId])

  const handleJoinSpace = () => {
    if (space.id && currentUserId) {
      joinSpace(space.id, currentUserId).then((res) => {
        if (res?.success) {
          setIsSpaceMember(true)
          setIsChannelMember?.(true)
          toast({
            title: "Space Joined",
            description: "You have successfully joined the Space!",
            duration: 3000
          })
          router.refresh()
        } else {
          console.error("Failed to join Space:", res?.error)
        }
      })
    }
  }

  const handleLeaveSpace = () => {
    if (space.id) {
      leaveSpace(space.id).then((res) => {
        if (res?.success) {
          setIsSpaceMember(false)
          toast({
            title: "Space Left",
            description: "You have successfully left the Space!",
            duration: 3000
          })
          router.refresh()
        } else {
          console.error("Failed to leave Space:", res?.error)
        }
      })
    }
  }

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )
  const canSpaceAllowAction = permissionChecker
    ? permissionChecker?.canAccess("space.allow.action")
    : false
  const canViewSpace = permissionChecker
    ? permissionChecker?.canAccess("space.view")
    : false

  return (
    <Card key={space.id} className="overflow-hidden">
      {/* <div className="aspect-video w-full overflow-hidden">
        <img
          src={"/images/home/session-image2.jpg"}
          alt={space.space_name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div> */}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center gap-1">
            {space.space_name}
            {space.space_type === "private" && (
              <Lock className="text-muted-foreground" height={14} />
            )}
            {space.publish_space ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Check className="text-muted-foreground" height={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Published</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PencilRuler
                      className="text-muted-foreground"
                      height={14}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Draft</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          {canSpaceAllowAction || space.space_type === "public" ? (
            <SpacesActionButtons
              space={space}
              setIsChannelMember={setIsChannelMember}
            />
          ) : null}
        </div>
        <CardDescription>{space.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 w-full">
        {/* <Badge variant="secondary">
          {space.membersCount} {space.membersCount === 1 ? 'Member' : 'Members'}
          0 Members
        </Badge> */}
        <div className="flex items-center w-full gap-2">
          <Link href={`./spaces/${encodedSpaceSlug}`}>
            <Button>
              Launch Space <ArrowRight />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default SpacesCard
