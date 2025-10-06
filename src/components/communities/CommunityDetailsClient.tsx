"use client"

import React, { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  Hash,
  Users,
  MessageCircle,
  Calendar,
  Settings,
  UserPlus,
  Lock,
  Globe,
  PlusCircle,
  PencilRuler,
  Check
} from "lucide-react"
import { CommunityDetailData } from "@/src/db/data-access/communities/query"
import CreateChannels from "@/src/components/Dashboard/Channels/CreateChannels"
import { useAtom, useAtomValue } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"
import { SelectChannel, SelectCommunity } from "@/src/db/schema"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import PaginationComponent from "../common/Pagination"
import { PaginationType } from "../common/types/pagination.type"
import { useSearchParams } from "next/navigation"
import ChannelsContextMenu from "@/src/components/Dashboard/Channels/ChannelDetails/ChannelsContextMenu"
import Link from "next/link"
import { userStore } from "@/src/store/user/userStore"
import Overlay from "../common/Overlay/OverLay"
import { communityStore } from "@/src/store/community/communityStore"
import { useSetAtom } from "jotai"
import { InviteUserDialog } from "../UserListAndInvite/UserInviteDialog"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { AttachCommunityUserAction } from "@/src/server-actions/Community/Community"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { isEntityUser } from "@/src/utils/clientHelper"
import { getInitials } from "@/src/utils/helpers"
import CreateShortcut from "../common/Shortcut/components/CreateShortcut"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import ChannelCardItem from "../Dashboard/Channels/ChannelCardItem"
import Image from "next/image"

interface CommunityDetailsClientProps {
  community: CommunityDetailData
}

interface ChannelsDataStructure {
  channels: SelectChannel[]
  pagination: PaginationType
}

const demoRules = [
  "Be respectful and professional",
  "No spam or self-promotion without permission",
  "Keep discussions relevant to technology",
  "Help others and share knowledge"
]

export default function CommunityDetailsClient({
  community
}: CommunityDetailsClientProps) {
  const { toast } = useToast()
  const setCurrentCommunity = useSetAtom(communityStore.selectedCommunity)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const [joinLoading, joinResult, joinError, attachCommunityUser] =
    useServerAction(AttachCommunityUserAction)
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [channels, setChannels] = useAtom(channelStore.channels)
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const [isCommunityMember, setIsCommunityMember] = useState<boolean | null>(
    null
  )
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    community?.id
  )

  useEffect(() => {
    if (community) {
      const transformedCommunity: SelectCommunity = {
        id: community.id,
        title: community.title,
        description: community.description,
        slug: community.slug,
        type: community.type,
        cover_image: community.cover_image,

        category_id: community.category,
        created_by: "unknown",
        updated_at: null,
        created_at: community.created_at
          ? community.created_at.toISOString()
          : null,
        deleted_at: null
      }
      setCurrentCommunity(transformedCommunity)
    }
  }, [community])

  useEffect(() => {
    if (currentUserId) {
      const isMember = isEntityUser(community, currentUserId)
      setIsCommunityMember(isMember)
    }
  }, [community, currentUserId])

  const showAccessDeniedOverlay =
    community.type === "private" && isCommunityMember === false && !isSuperAdmin

  useEffect(() => {
    const fetchCommunityChannels = async () => {
      // If access is denied, don't fetch channels
      if (showAccessDeniedOverlay || !community?.id) {
        setChannels([])
        setPagination({ total: 0, page: 1, limit: 6, totalPages: 0 })
        setLoadingChannels(false)
        return
      }
      setLoadingChannels(true)
      try {
        const res = await GetChannelsAction({
          communityId: community.id,
          page,
          limit: 6
        })
        if (res?.data) {
          setChannels(res.data.channels)
          setPagination(res.data.pagination)
        } else {
          setChannels([])
          setPagination({ total: 0, page: 1, limit: 6, totalPages: 0 })
        }
      } catch (error) {
        console.error("Failed to fetch community channels:", error)
        setChannels([])
        setPagination({ total: 0, page: 1, limit: 6, totalPages: 0 })
      } finally {
        setLoadingChannels(false)
      }
    }

    if (isCommunityMember !== null) {
      fetchCommunityChannels()
    }
  }, [
    community?.id,
    page,
    setChannels,
    showAccessDeniedOverlay,
    isCommunityMember
  ])

  if (
    isCommunityMember === null &&
    community.type === "private" &&
    !isSuperAdmin
  ) {
    return (
      <div className="flex justify-center h-full w-full">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  const communityInitial = community?.title ? getInitials(community.title) : "C"

  const onActionComplete = (
    actionType: "create" | "updated" | "deleted",
    channel: SelectChannel
  ) => {
    if (actionType === "create") {
      setChannels((prevChannels) => [channel, ...prevChannels])
      if (pagination) {
        setPagination((prev) => ({
          ...prev!,
          total: prev!.total + 1,
          totalPages: Math.ceil((prev!.total + 1) / prev!.limit)
        }))
      }
    } else if (actionType === "updated") {
      setChannels((prevChannels) =>
        prevChannels.map((c) => (c.id === channel.id ? channel : c))
      )
    } else if (actionType === "deleted") {
      setChannels((prevChannels) =>
        prevChannels.filter((c) => c.id !== channel.id)
      )
      if (pagination) {
        setPagination((prev) => ({
          ...prev!,
          total: prev!.total - 1,
          totalPages: Math.ceil((prev!.total - 1) / prev!.limit)
        }))
      }
    }
  }

  const currentChannels = channels || []
  const channelsCount = currentChannels.length

  const canInviteUser = permissionChecker
    ? permissionChecker?.canAccess("community.user.invite")
    : false

  const handleJoinCommunity = async () => {
    if (community.id && currentUserId) {
      const res = await attachCommunityUser(community.id, currentUserId)
      if (res?.success) {
        setIsCommunityMember(true)
        toast({
          title: "Community Joined",
          description: "You have successfully joined the community!",
          duration: 3000
        })
      } else {
        console.error("Failed to join community:", res?.error)
      }
    }
  }

  const encodedCommunitySlug = encodeURIComponent(community.slug)

  return (
    <div className="min-h-screen bg-background relative">
      {/* Added relative for the overlay positioning */}
      {showAccessDeniedOverlay && (
        <Overlay page="Community" pageHref="/communities" />
      )}
      <div className="flex flex-col min-h-screen">
        {/* Community Header Banner */}
        <div className="relative sm:h-44 h-36 shadow-sm rounded-lg overflow-hidden">
          {community.cover_image ? (
            <Image
              src={community.cover_image}
              alt={community.title}
              width={1000}
              height={1000}
              objectFit="cover"
              className="w-full h-36 sm:h-44 rounded-lg"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full object-cover cover-pattern" />
          )}
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 px-4 py-4 sm:py-6 sm:px-6 flex flex-col gap-4 justify-center h-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 h-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                {/* Community Avatar */}
                <div className="relative">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white">
                    <AvatarImage
                      src="/placeholder.png"
                      alt={community?.title || "Community"}
                    />
                    <AvatarFallback className="text-xl md:text-2xl font-bold">
                      {communityInitial}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Community Info */}
                <div className="text-white flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 w-full">
                    <div className="flex items-center w-full min-w-0">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                        {community?.title}
                      </h1>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <Badge variant="secondary" className="text-xs">
                          {community?.type === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {/* Description & stats - hidden on mobile */}
                  <p className="hidden md:block text-gray-200 mb-3 text-sm md:text-base max-w-2xl truncate">
                    {community?.description}
                  </p>
                  <div className="hidden md:flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {community?.totalMembers?.toLocaleString() ?? 0} members
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>{community?.onlineNow ?? 0} online</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white text-xs"
                    >
                      {community?.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="hidden md:flex md:flex-col gap-2 self-start md:self-auto flex-shrink-0">
                {canInviteUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setIsInviteDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Invite</span>
                  </Button>
                )}
                {!isSuperAdmin && (
                  <Button
                    variant="outline"
                    onClick={handleJoinCommunity}
                    disabled={isCommunityMember || joinLoading}
                    className={
                      isCommunityMember
                        ? "text-gray-500 cursor-not-allowed"
                        : ""
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {joinLoading
                      ? "Joining..."
                      : isCommunityMember
                        ? "Joined"
                        : "Join"}
                  </Button>
                )}
                <CreateShortcut
                  type="community"
                  entity={{
                    slug: community?.slug ?? "",
                    title: community?.title ?? ""
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile - extra info section */}
        <div className="md:hidden px-4 py-4 space-y-4 border-b bg-background">
          <p className="text-sm text-muted-foreground">
            {community?.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                {community?.totalMembers?.toLocaleString() ?? 0}
              </span>
              <span>members</span>
            </div>
            <span>•</span>
            <span>{community?.onlineNow ?? 0} online</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {community?.category}
          </Badge>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsInviteDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Options
            </Button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex border-t">
          {/* Left Main Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Text Channels */}
              <div className="bg-background rounded-lg border sm:p-6 p-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="sm:text-lg text-base font-semibold flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Channels
                  </h3>
                  <CreateChannels
                    community={community}
                    onActionComplete={onActionComplete}
                  />
                </div>
                {loadingChannels ? (
                  <div className="flex justify-center py-8">
                    <Loader size={LoaderSizes.md} />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      {channelsCount} channels available
                    </p>
                    <div className="space-y-2">
                      {currentChannels.length > 0 ? (
                        currentChannels.map((channel) => {
                          const encodedChannelSlug = encodeURIComponent(
                            channel.channel_slug
                          )
                          return (
                            <div key={channel.id}>
                              <ChannelCardItem
                                channel={channel}
                                onActionComplete={onActionComplete}
                                setIsCommunityMember={setIsCommunityMember}
                              />
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No channels found in this community.
                        </p>
                      )}
                    </div>
                    {pagination && pagination.totalPages > 1 && (
                      <PaginationComponent pagination={pagination} />
                    )}
                  </>
                )}
              </div>
              {/* Mobile - Stats and About */}
              <div className="block lg:hidden space-y-6 mt-6">
                {/* Community Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg">
                      Community Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs lg:text-sm">
                          Total Members
                        </span>
                      </div>
                      <span className="font-bold text-sm lg:text-base">
                        {community.totalMembers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-xs lg:text-sm">Online Now</span>
                      </div>
                      <span className="font-bold text-sm lg:text-base">
                        {community.onlineNow}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs lg:text-sm">
                          Total Messages
                        </span>
                      </div>
                      <span className="font-bold text-sm lg:text-base">
                        {community.totalMessages?.toLocaleString?.() ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs lg:text-sm">Created</span>
                      </div>
                      <span className="font-bold text-sm lg:text-base">
                        {community.created_at
                          ? community.created_at.getFullYear()
                          : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                {/* About */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base lg:text-lg">
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Owner
                      </span>
                      <p className="text-sm">{community.owner?.fullName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Category
                      </span>
                      <p className="text-sm">{community.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Privacy
                      </span>
                      <div className="flex items-center gap-2">
                        {community.type === "public" ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm capitalize">
                          {community.type}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Community Rules */}
              <div className="bg-background rounded-lg border sm:p-6 p-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">
                      📋
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">Community Rules</h3>
                </div>
                <div className="space-y-3">
                  {demoRules.map((rule, index) => (
                    <div key={index} className="flex gap-4">
                      <span className="text-muted-foreground font-medium min-w-[24px] shrink-0">
                        {index + 1}.
                      </span>
                      <span className="text-muted-foreground leading-relaxed">
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 xl:w-96 border-l bg-muted/10 p-6 space-y-6 overflow-y-auto">
            {/* Community Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg">
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/communities/${encodedCommunitySlug}/users`}
                      className="text-xs lg:text-sm hover:underline hover:decoration-white"
                    >
                      Members
                    </Link>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {community?.totalMembers?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-xs lg:text-sm">Online Now</span>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {community?.onlineNow ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs lg:text-sm">Total Messages</span>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {community?.totalMessages?.toLocaleString?.() ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs lg:text-sm">Created</span>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {community?.created_at
                      ? community.created_at.getFullYear()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Owner
                  </span>
                  <p className="text-sm">{community?.owner?.fullName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Category
                  </span>
                  <p className="text-sm">{community?.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Privacy
                  </span>
                  <div className="flex items-center gap-2">
                    {community?.type === "public" ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm capitalize">
                      {community?.type}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        spaceName="Platform"
        type={["link"]}
        entityType="community"
        entity={community}
      />
    </div>
  )
}
