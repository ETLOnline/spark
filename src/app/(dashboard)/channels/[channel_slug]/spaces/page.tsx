"use client"

import { useParams, useRouter } from "next/navigation"
import { useAtom, useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { channelStore } from "@/src/store/channel/channelStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { userStore } from "@/src/store/user/userStore"
import SpacesCard from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/SpacesCard"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import CreateSpaceModal from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/CreateSpaceModal"
import { Button } from "@/src/components/ui/button"
import { CirclePlus, LogOut, PlusCircle } from "lucide-react"
import { GetSpacesAction } from "@/src/server-actions/Space/Space"
import { spaceStore } from "@/src/store/space/spaceStore"
import { SelectChannel, SelectSpace } from "@/src/db/schema"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import PrivatePage from "@/src/components/common/Overlay/PrivatePage"
import { communityStore } from "@/src/store/community/communityStore"
import {
  AttachChannelUserAction,
  LeaveChannelAction
} from "@/src/server-actions/Channel/Channel"
import { isEntityUser } from "@/src/utils/clientHelper"
import CreateShortcut from "@/src/components/common/Shortcut/components/CreateShortcut"
import { useToast } from "@/src/hooks/use-toast"
import "../spaces/../../../style.css"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/components/ui/alert-dialog"
import pusherClient from "@/src/services/realtime/PusherClient"
import { EntityUpdateBroadCast } from "@/src/utils/constants"

export default function ChannelPage() {
  const router = useRouter()
  const { toast } = useToast()
  const community = useAtomValue(communityStore.selectedCommunity)
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const [isChannelMember, setIsChannelMember] = useState<boolean>(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [channelLoading, setChannelLoading] = useState<boolean>(true)
  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )
  const [joinedSpaces, setJoinedSpaces] = useState<SelectSpace[]>([])
  const [spaces, setSpaces] = useAtom(spaceStore.spaces)
  const user = useAtomValue(userStore.AuthUser)
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] =
    useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const channelSlug = useParams().channel_slug

  const [spacesLoading, spacesData, spacesError, getSpaces] =
    useServerAction(GetSpacesAction)

  const [joinLoading, joinResult, joinError, joinChannel] = useServerAction(
    AttachChannelUserAction
  )
  const [leaveLoading, leaveResult, leaveError, leaveChannel] =
    useServerAction(LeaveChannelAction)

  useEffect(() => {
    const channel = pusherClient.subscribe(EntityUpdateBroadCast)

    channel.bind("space-add", (newSpace: SelectSpace) => {
      if (newSpace.channel_id === selectedChannel?.id) {
        const isUserMember = newSpace.users?.some(
          (u) => u.user_id === currentUserId
        )

        if (isUserMember) {
          setJoinedSpaces((prev) => {
            if (prev.some((s) => s.id === newSpace.id)) return prev
            return [...prev, newSpace]
          })
        } else {
          setSpaces((prev) => {
            if (prev.some((s) => s.id === newSpace.id)) return prev
            return [...prev, newSpace]
          })
        }
      }
    })

    channel.bind("space-edit", (updatedSpace: SelectSpace) => {
      if (updatedSpace.channel_id === selectedChannel?.id) {
        setSpaces((prev) =>
          prev.map((space) =>
            space.id === updatedSpace.id ? updatedSpace : space
          )
        )
        setJoinedSpaces((prev) =>
          prev.map((space) =>
            space.id === updatedSpace.id ? updatedSpace : space
          )
        )
      }
    })

    channel.bind("space-del", (deletedSpace: SelectSpace) => {
      if (deletedSpace.channel_id === selectedChannel?.id) {
        setSpaces((prev) =>
          prev.filter((space) => space.id !== deletedSpace.id)
        )
        setJoinedSpaces((prev) =>
          prev.filter((space) => space.id !== deletedSpace.id)
        )
      }
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [selectedChannel?.id, currentUserId])

  const handleJoinChannel = async () => {
    if (
      selectedChannel?.channel_type !== "public" ||
      isChannelMember ||
      !selectedChannel?.id ||
      !authUser?.unique_id
    ) {
      return
    }

    try {
      const res = await joinChannel(selectedChannel.id, authUser.unique_id)
      if (res?.success) {
        toast({
          title: "Channel Joined",
          description: "You have successfully joined the channel!",
          duration: 3000
        })
        fetchChannel()
      }
    } catch (error) {
      setIsChannelMember(false)
      toast({
        title: "Error",
        description: "Something went wrong while joining the channel.",
        duration: 3000
      })
    }
  }

  const handleLeaveChannel = async () => {
    if (selectedChannel?.id && isChannelMember && currentUserId) {
      try {
        const res = await leaveChannel(selectedChannel.id, currentUserId)
        if (res?.success) {
          setIsChannelMember(false)
          toast({
            title: "Channel Left",
            description: "You have left the channel and its spaces.",
            duration: 3000
          })
          fetchChannel()
          if (community?.slug) {
            router.push(`/communities/${community.slug}`)
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong while leaving the channel.",
          duration: 3000
        })
      }
    }
  }
  const fetchChannel = async () => {
    setChannelLoading(true)

    const slug = decodeURIComponent(channelSlug as string)
    const res = await getSpaces({ channel_slug: slug })

    if (res?.success && res.data) {
      if (res.data.channel) {
        setSelectedChannel(res.data.channel)
      }
      if (res.data.paginatedSpaces && res.data.joinedSpaces) {
        const publicSpaces = res.data.paginatedSpaces.spaces || []
        const joinedSpaces = res.data.joinedSpaces || []
        const uniquePublicSpaces = publicSpaces.filter(
          (publicSpace) =>
            !joinedSpaces.some(
              (joinedSpace) => joinedSpace.id === publicSpace.id
            )
        )
        setSpaces(uniquePublicSpaces)
        setJoinedSpaces(joinedSpaces)
      } else {
        setSpaces([])
        setJoinedSpaces([])
      }
    } else {
      setSpaces([])
      setJoinedSpaces([])
      setSelectedChannel(null)
    }

    setChannelLoading(false)
  }
  useEffect(() => {
    setSpaces([])
    setJoinedSpaces([])
    setSelectedChannel(null)

    fetchChannel()
  }, [channelSlug])

  useEffect(() => {
    if (!channelLoading && selectedChannel && authUser?.unique_id) {
      const isMember = isEntityUser(
        selectedChannel as SelectChannel,
        authUser.unique_id
      )
      setIsChannelMember(isMember)
      setIsLoading(false)
    }
  }, [channelLoading, selectedChannel, authUser])

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "CHANNEL",
    selectedChannel?.id
  )
  const canCreateSpace = permissionChecker
    ? permissionChecker?.canAccess("channel.space.create")
    : false
  function handleCreateSpace() {
    setSpaceFormModelVisibility(true)
  }

  const isUserMember =
    selectedChannel?.channel_type === "private"
      ? selectedChannel?.users?.some((user) => user.user_id === currentUserId)
      : true
  const showAccessDeniedOverlay =
    selectedChannel?.channel_type === "private" &&
    !isUserMember &&
    !isSuperAdmin
  if (showAccessDeniedOverlay) {
    return (
      <PrivatePage
        page="Channel"
        pageHref={`/communities/${community?.slug}`}
      />
    )
  }
  return (
    <div className="min-h-screen bg-background relative">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-4 sm:p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-xl font-bold">
                Spaces in{" "}
                <span className="text-2xl  font-bold">
                  {selectedChannel?.channel_name}
                </span>
              </h1>
              <div className="flex items-center gap-2 ">
                {isLoading ? (
                  <Button variant="outline" disabled>
                    Loading...
                  </Button>
                ) : (
                  !isSuperAdmin &&
                  selectedChannel?.channel_type === "public" &&
                  !isChannelMember && (
                    <Button
                      variant="outline"
                      onClick={handleJoinChannel}
                      disabled={joinLoading}
                      loading={joinLoading}
                      className=" font-medium px-6 py-2 hover:bg-primary hover:text-primary-foreground"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {joinLoading ? "Joining..." : "Join Channel"}
                    </Button>
                  )
                )}

                {!isSuperAdmin && isChannelMember && (
                  <Button
                    variant="outline"
                    onClick={() => setLeaveDialogOpen(true)}
                    disabled={leaveLoading}
                    loading={leaveLoading}
                    className={`leave-btn${leaveLoading ? " disabled" : ""}`}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {leaveLoading ? "Leaving..." : "Leave Channel"}
                  </Button>
                )}

                {selectedChannel?.id && user && canCreateSpace ? (
                  <>
                    <CreateSpaceModal
                      spaceFormModelVisibility={spaceFormModelVisibility}
                      setSpaceFormModelVisibility={setSpaceFormModelVisibility}
                    />
                    <Button onClick={handleCreateSpace}>
                      <CirclePlus className="h-4 w-4" />
                      Create Space
                    </Button>
                  </>
                ) : null}

                <CreateShortcut
                  type="channel"
                  entity={{
                    slug: selectedChannel?.channel_slug ?? "",
                    title: `${selectedChannel?.channel_name}`,
                    entity_id:selectedChannel?.id ?? ""
                  }}
                />
              </div>
            </div>
            {spacesLoading ? (
              <div className="flex justify-center h-full w-full">
                <Loader size={LoaderSizes.xl} />
              </div>
            ) : (
              <>
                {!isSuperAdmin &&
                  (joinedSpaces && joinedSpaces.length > 0 ? (
                    <>
                      <h2 className="text-xl font-bold sm:text-2xl">
                        Joined Spaces
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  2xl:grid-cols-5   gap-6">
                        {joinedSpaces.map((js) => (
                          <SpacesCard space={js} key={js.id} />
                        ))}
                      </div>
                    </>
                  ) : null)}
                {spaces?.length === 0 ? (
                  <NoDataCard title="No Spaces Available" />
                ) : (
                  <>
                    {joinedSpaces.length > 0 ? (
                      <h2 className="text-xl font-bold sm:text-2xl">Spaces</h2>
                    ) : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  2xl:grid-cols-5   gap-6">
                      {spaces?.map((space) => (
                        <SpacesCard
                          space={space}
                          key={space.id}
                          setIsChannelMember={setIsChannelMember}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Channel?</AlertDialogTitle>
            <AlertDialogDescription>
              By leaving this, you will also be removed from related spaces.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              loading={leaveLoading}
              onClick={async () => {
                await handleLeaveChannel()
                setLeaveDialogOpen(false)
              }}
            >
              Leave Channel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
