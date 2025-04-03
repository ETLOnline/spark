"use client"

import Image from "next/image"
import { useParams } from "next/navigation"
import { useAtom, useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { channelStore } from "@/src/store/channel/channelStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetChannelBySlugAction } from "@/src/server-actions/Channel/Channel"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { userStore } from "@/src/store/user/userStore"
import SpacesCard from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/SpacesCard"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import CreateSpaceModal from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/CreateSpaceModal"
import { Button } from "@/src/components/ui/button"
import { CirclePlus } from "lucide-react"

export default function ChannelPage() {
  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )
  const userRole = useAtomValue(userStore.AuthUser)?.role
  const userId = useAtomValue(userStore.AuthUser)?.unique_id
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] = useState(false)


  const channelSlug = useParams().channel_slug

  const [channelLoading, channelData, channelError, getChannel] =
    useServerAction(GetChannelBySlugAction)

  useEffect(() => {
    const fetchChannel = async () => {
      const slug = decodeURIComponent(channelSlug as string)
      const res = await getChannel(slug)
      if (res?.success && res.data) {
        setSelectedChannel(res?.data)
      }
    }
    fetchChannel()
  }, [])

  function handleCreateSpace() {
    setSpaceFormModelVisibility(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative h-40 sm:h-25 w-full">
        <Image
          src="/images/channels/channel_sample_image.jpg"
          alt="Sample image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {selectedChannel?.channel_name}
          </h1>
        </div>
      </div>
      <main className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold">
              Spaces in {selectedChannel?.channel_name}
            </h2>
            {userRole?.includes("admin") ||
              selectedChannel?.ownerId === userId ? (
              <>
                <CreateSpaceModal spaceFormModelVisibility={spaceFormModelVisibility} setSpaceFormModelVisibility={setSpaceFormModelVisibility} />
                <Button onClick={handleCreateSpace}>
                  <CirclePlus className="h-4 w-4" />
                  Create Space
                </Button>
              </>
            ) : null}
          </div>
          {channelLoading ? (
            <div className="flex justify-center h-full w-full">
              <Loader size={LoaderSizes.xl} />{" "}
            </div>
          ) : (selectedChannel?.spaces?.length === 0 ?
            <NoDataCard title="No Spaces Available" /> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  2xl:grid-cols-5   gap-6">
              {selectedChannel?.spaces?.map((space) => (
                <SpacesCard space={space} key={space.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
