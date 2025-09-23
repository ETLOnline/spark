"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Users,
  Hash,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Lock,
  Globe,
  User,
  PlusCircle,
  ArrowRight,
  LogOut
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"

import { SelectCommunity } from "@/src/db/schema"
import Link from "next/link"
import { getInitials } from "@/src/utils/helpers"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import {
  AttachCommunityUserAction,
  LeaveCommunityAction
} from "@/src/server-actions/Community/Community"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import CreateShortcut from "../common/Shortcut/components/CreateShortcut"
import clsx from "clsx"
import { communityStore } from "@/src/store/community/communityStore"

interface CommunityCardProps {
  community: SelectCommunity
  showStar?: boolean
  canManage?: boolean
  onEdit: (community: SelectCommunity) => void
  onDelete: (community: SelectCommunity) => void
  onJoin: () => void
}

export default function CommunityCard({
  community,
  onEdit,
  onDelete,
  onJoin
}: CommunityCardProps) {
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    community.id
  )

  const encodedCommunitySlug = encodeURIComponent(community.slug)
  const { toast } = useToast()
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const superAdmin = useAtomValue(userStore.SuperAdmin)
  const isCurrentUserMember = community?.communityMembers?.some(
    (member) => member.user_id === currentUserId
  )
  const setRefreshCommunity = useSetAtom(
    communityStore.refreshCommunitiesTriggerAtom
  )
  const [joinLoading, joinResult, joinError, attachCommunityUser] =
    useServerAction(AttachCommunityUserAction)
  const [leaveLoading, leaveResult, leaveError, leaveCommunity] =
    useServerAction(LeaveCommunityAction)

  const allowAction = permissionChecker
    ? permissionChecker?.canAccess("community.allow.action")
    : false
  const canEdit = permissionChecker
    ? permissionChecker?.canAccess("community.update")
    : false
  const canDelete = permissionChecker
    ? permissionChecker?.canAccess("community.delete")
    : false
  const canView = permissionChecker
    ? permissionChecker?.canAccess("community.view")
    : false

  const handleJoinCommunity = async () => {
    if (!community.id || !currentUserId) return

    try {
      const res = await attachCommunityUser(community.id, currentUserId)

      if (res?.success) {
        setRefreshCommunity((pre) => !pre)
        toast({
          title: "Community Joined",
          description: "You have successfully joined the community!",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while joining the community.",
        variant: "destructive"
      })
    }
  }

  const handleLeaveCommunity = async () => {
    if (!community.id || !currentUserId) return

    try {
      const res = await leaveCommunity(community.id, currentUserId)

      if (res?.success) {
        setRefreshCommunity((pre) => !pre)

        toast({
          title: "Left community",
          description: "You have left the community.",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while leaving the community.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage src={"/images/default-avatar.png"} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700">
              {getInitials(community.title)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3 min-w-0 max-w-full overflow-hidden">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <CardTitle className="text-xl font-bold truncate max-w-[calc(100%-40px)]">
                {community.title}
              </CardTitle>

              {(allowAction || community.type === "public") && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Community actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => onEdit(community)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/communities/${encodedCommunitySlug}/users`}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Users
                        </Link>
                      </DropdownMenuItem>
                      {canView && (
                        <DropdownMenuItem asChild>
                          <Link href={`/communities/${encodedCommunitySlug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Detail
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <CreateShortcut
                        type="community"
                        entity={{
                          slug: community.slug ?? "",
                          title: `${community.title}`
                        }}
                        ctaType="menuItem"
                      />
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(community)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">{community?.category?.name}</Badge>
              {community.type === "public" ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : community.type === "private" ? (
                <Lock className="h-4 w-4 text-yellow-500" />
              ) : null}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{community.communityMembers?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-grow space-y-4">
        {/* Upper: Description + Channels */}
        <div>
          <CardDescription className="text-sm leading-relaxed line-clamp-3">
            {community.description}
          </CardDescription>
          <div className="flex items-center gap-1 mt-3 text-muted-foreground text-sm">
            <Hash className="h-4 w-4" />
            <span>
              {`${community.channels?.length || 0} ${(community.channels?.length || 0) === 1 ? "channel" : "channels"}`}
            </span>
          </div>
        </div>
        {/* Bottom: Buttons */}
        <div className="flex justify-end flex-wrap items-center gap-2 mt-auto">
          {((!superAdmin && community.type === "public") ||
            (!superAdmin && isCurrentUserMember)) && (
            <>
              {!isCurrentUserMember ? (
                <Button
                  variant="outline"
                  onClick={handleJoinCommunity}
                  disabled={joinLoading}
                  loading={joinLoading}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {joinLoading ? "Joining..." : "Join"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleLeaveCommunity}
                  disabled={leaveLoading}
                  loading={leaveLoading}
                  className={clsx(
                    "text-red-500",
                    "hover:bg-red-500 hover:text-white",
                    "dark:hover:bg-muted dark:hover:text-red-500"
                  )}
                >
                  <LogOut className=" h-4 w-4" />
                  {leaveLoading ? "Leaving..." : "Leave"}
                </Button>
              )}
            </>
          )}
          <Link href={`/communities/${encodedCommunitySlug}`}>
            <Button variant="outline">
              View <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
