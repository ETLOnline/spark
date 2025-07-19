"use client"

import { useParams } from "next/navigation"
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
import { CirclePlus } from "lucide-react"
import { canControlChannel } from "@/src/utils/channelRoleHelper"
import { GetSpacesAction } from "@/src/server-actions/Space/Space"
import { spaceStore } from "@/src/store/space/spaceStore"
import { SelectChannel, SelectSpace } from "@/src/db/schema"
import { isUserAdmin } from "@/src/utils/helpers"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import Overlay from "@/src/components/common/Overlay/OverLay"
import { communityStore } from "@/src/store/community/communityStore"
import { AttachChannelUserAction } from "@/src/server-actions/Channel/Channel"
import { isEntityUser } from "@/src/utils/clientHelper"
import CreateShortcut from "@/src/components/common/Shortcut/components/CreateShortcut"

export default function ChannelPage() {
  const community = useAtomValue(communityStore.selectedCommunity)
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const [isChannelMember, setIsChannelMember] = useState<boolean>(false)

  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )
  const [joinedSpaces, setJoinedSpaces] = useState<SelectSpace[]>([])
  const [spaces, setSpaces] = useAtom(spaceStore.spaces)
  const user = useAtomValue(userStore.AuthUser)
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] =
    useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const isAdmin = authUser ? isUserAdmin(authUser) : false
  const channelSlug = useParams().channel_slug

  const [spacesLoading, spacesData, spacesError, getSpaces] =
    useServerAction(GetSpacesAction)

  const [joinLoading, joinResult, joinError, joinChannel] = useServerAction(
    AttachChannelUserAction
  )

  useEffect(() => {
    const isMember = isEntityUser(
      selectedChannel as SelectChannel,
      authUser?.unique_id as string
    )

    if (isMember) setIsChannelMember(true)
    else {
      setIsChannelMember(false)
    }
  }, [selectedChannel, authUser])

  async function handleJoinChannel() {
    if (
      selectedChannel?.channel_type === "public" &&
      !isChannelMember &&
      selectedChannel?.id &&
      authUser?.unique_id
    ) {
      const res = await joinChannel(selectedChannel.id, authUser.unique_id)
      if (res?.success) setIsChannelMember(true)
      else {
        setIsChannelMember(false)
      }
    }
  }

  useEffect(() => {
    const fetchChannel = async () => {
      const slug = decodeURIComponent(channelSlug as string)
      const res = await getSpaces({ channel_slug: slug })
      if (res?.success && res.data) {
        if (res.data.channel) {
          setSelectedChannel(res?.data.channel)
        }
        if (res.data.paginatedSpaces && res.data.joinedSpaces) {
          const publicSpaces = res.data.paginatedSpaces.spaces || []
          const joinedSpaces = res.data.joinedSpaces || []
          if (publicSpaces.length === 0 && joinedSpaces.length === 0) {
            setSpaces([])
            setJoinedSpaces([])
          } else {
            const uniquePublicSpaces = publicSpaces.filter(
              (publicSpace) =>
                !joinedSpaces.some(
                  (joinedSpace) => joinedSpace.id === publicSpace.id
                )
            )

            setSpaces(uniquePublicSpaces)
            setJoinedSpaces(joinedSpaces)
          }
        } else {
          setSpaces([])
          setJoinedSpaces([])
        }
      } else {
        setSpaces([])
        setJoinedSpaces([])
        setSelectedChannel(null)
      }
    }

    setSpaces([])
    setJoinedSpaces([])
    setSelectedChannel(null)

    fetchChannel()
  }, [])

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "CHANNEL",
    selectedChannel?.id
  )
  const canCreateSpace = permissionChecker
    ? permissionChecker?.canAccess("space.create")
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

  return (
    <div className="min-h-screen bg-background relative">
      {/* Added relative for the overlay positioning */}
      {showAccessDeniedOverlay && (
        <Overlay page="Channel" pageHref={`/communities/${community?.slug}`} />
      )}
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
                {!isSuperAdmin &&
                  selectedChannel?.channel_type === "public" && (
                    <Button
                      variant="outline"
                      onClick={handleJoinChannel}
                      disabled={isChannelMember || joinLoading}
                      className={`border-2 border-red-500 font-bold px-6 py-2 ${isChannelMember ? "bg-red-500 text-white" : "text-red-500 hover:bg-red-500 hover:text-white"}`}
                    >
                      {isChannelMember
                        ? "Joined"
                        : joinLoading
                          ? "Joining..."
                          : "Join"}
                    </Button>
                  )}

                {(selectedChannel?.id &&
                  user &&
                  canControlChannel(selectedChannel.id, user)) ||
                canCreateSpace ? (
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
                    title: `${selectedChannel?.community?.title} - ${selectedChannel?.channel_name}`
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
                {!isAdmin &&
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
                        <SpacesCard space={space} key={space.id} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
