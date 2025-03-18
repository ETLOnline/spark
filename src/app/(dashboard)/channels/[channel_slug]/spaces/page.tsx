"use client"

import { Edit3, Settings, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { useParams } from "next/navigation"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useEffect } from "react"
import { channelStore } from "@/src/store/channel/channelStore"
import CreateSpaceModal from "@/src/components/Dashboard/Spaces/CreateSpaceModal/CreateSpaceModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/src/components/ui/alert-dialog"
import { SelectSpace } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { DeleteSpaceAction } from "@/src/server-actions/Space/Space"
import { GetChannelBySlugAction } from "@/src/server-actions/Channel/Channel"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/Loader/types/loader-types"
import { userStore } from "@/src/store/user/userStore"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"

export default function ChannelPage() {
  const [spaces, setSpaces] = useAtom(spaceStore.spaces)
  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )
  const setSelecteSpace = useSetAtom(spaceStore.selectedSpace)
  const setSpaceFormModelVisibility = useSetAtom(
    spaceStore.spaceFormModelVisibility
  )
  const userRole = useAtomValue(userStore.AuthUser)?.role

  const channelSlug = useParams().channel_slug

  const [
    addDeleteSpaceLoading,
    addDeleteSpaceData,
    addDeleteSpaceError,
    deleteSpace
  ] = useServerAction(DeleteSpaceAction)
  const [channelLoading, channelData, channelError, getChannel] =
    useServerAction(GetChannelBySlugAction)

  useEffect(() => {
    const fetchChannel = async () => {
      const slug = decodeURIComponent(channelSlug as string)
      const res = await getChannel(slug)
      if (res?.success && res.data) {
        setSelectedChannel(res?.data)
        setSpaces(res.data.spaces)
      }
    }
    fetchChannel()
  }, [])

  function handleEditSpace(space: SelectSpace) {
    setSpaceFormModelVisibility(true)
    setSelecteSpace(space)
  }

  async function handleDeleteSpace(selectedSpace: SelectSpace) {
    const deletedSpace = await deleteSpace(selectedSpace)
    if (deletedSpace?.success) {
      setSpaces((spaces) =>
        spaces.filter((spaces) => spaces.id !== selectedSpace?.id)
      )
    }
  }

  return userRole?.includes("admin") ? (
    <div className="flex min-h-screen flex-col">
      <div className="relative h-40 sm:h-56 w-full">
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
            <CreateSpaceModal space={spaces} setSpace={setSpaces} />
          </div>
          {channelLoading ? (
            <div className="flex justify-center h-full w-full">
              <Loader size={LoaderSizes.xl} />{" "}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className="rounded-lg border bg-card p-4 flex flex-col sm:flex-row justify-between"
                >
                  <Link href={`./spaces/${space.space_slug}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                        <Image
                          src="/images/home/session-image2.jpg"
                          alt={space.space_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{space.space_name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {space.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" onClick={() => handleEditSpace(space)}>
                      <Edit3 />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant={"destructive"}>
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete space.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSpace(space)}
                            loading={addDeleteSpaceLoading}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Link href={`./spaces/${space.space_slug}/settings`}>
                      <Button size="sm">
                        <Settings />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  ) : (
    <NotFound />
  )
}
