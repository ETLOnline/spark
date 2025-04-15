"use client"

import Image from "next/image"
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
import { SelectSpace } from "@/src/db/schema"
import { isUserAdmin } from "@/src/utils/helpers"
import { GridPattern } from "@/src/components/magicui/grid-pattern"
import { cn } from "@/src/lib/utils"

export default function ChannelPage() {
  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )
  const [joinedSpaces, setJoinedSpaces] = useState<SelectSpace[]>([])
  const [spaces, setSpaces] = useAtom(spaceStore.spaces)
  const user = useAtomValue(userStore.AuthUser)
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const isAdmin = authUser ? isUserAdmin(authUser) : false


  const channelSlug = useParams().channel_slug

  const [spacesLoading, spacesData, spacesError, getSpaces] = useServerAction(GetSpacesAction)
  const [shouldRedirect, setShouldRedirect] = useState(false)


  useEffect(() => {
    const fetchChannel = async () => {
      const slug = decodeURIComponent(channelSlug as string)
      const res = await getSpaces({ channel_slug: slug })
      if (res?.success && res.data) {
        if (res.data.channel) {
          setSelectedChannel(res?.data.channel)
        }
        if (res.data.paginatedSpaces && res.data.joinedSpaces) {
          setSpaces(res.data.paginatedSpaces.spaces)
          setJoinedSpaces(res.data.joinedSpaces)
        }
      }
    }
    fetchChannel()
  }, [])

  function handleCreateSpace() {
    setSpaceFormModelVisibility(true)
    setShouldRedirect(false)

  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <div className="relative h-40 sm:h-25 w-full">
        <Image
          src="/images/channels/channel_sample_image.jpg"
          alt="Sample image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
        </div>
      </div> */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold">
              Spaces in <span className="text-2xl sm:text-3xl font-bold">
                {selectedChannel?.channel_name}
              </span>
            </h1>
            <div>

              {selectedChannel?.id && user && canControlChannel(selectedChannel.id, user) ? (
                <>
                  <CreateSpaceModal spaceFormModelVisibility={spaceFormModelVisibility} setSpaceFormModelVisibility={setSpaceFormModelVisibility} shouldRedirect={shouldRedirect} />
                  <Button onClick={handleCreateSpace}>
                    <CirclePlus className="h-4 w-4" />
                    Create Space
                  </Button>
                </>
              ) : null}
            </div>
          </div>
          {
            spacesLoading ? (
              <div className="flex justify-center h-full w-full">
                <Loader size={LoaderSizes.xl} />{" "}
              </div>
            ) : (
              <>
                {!isAdmin && (
                  joinedSpaces && joinedSpaces.length > 0 ? (
                    <>
                      <h2 className="text-xl font-bold sm:text-2xl">Joined Spaces</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  2xl:grid-cols-5   gap-6">
                        {joinedSpaces.map((js) => (
                          <SpacesCard space={js} key={js.id} />
                        ))}
                      </div>
                    </>
                  ) : null)
                }
                {spaces?.length === 0 ? (
                  <NoDataCard title="No Spaces Available" />
                ) : (
                  <>
                    <h2 className="text-xl font-bold sm:text-2xl">Spaces</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  2xl:grid-cols-5   gap-6">
                      {spaces?.map((space) => (
                        <SpacesCard space={space} key={space.id} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )
          }
        </div>
      </main>
    </div>
  )
}
