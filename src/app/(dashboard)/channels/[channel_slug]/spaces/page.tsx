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
import { toast } from "@/src/hooks/use-toast"
import { userStore } from "@/src/store/user/userStore"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"

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
      toast({
        title: "Space deleted successfully.",
        duration: 3000
      })
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
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3  gap-4 sm:gap-6">
              {spaces.map((space) => (
                <Card key={space.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <Link href={`./spaces/${space.space_slug}`}>
                        <div className="relative h-12 w-12 overflow-hidden rounded-md">
                          <Image
                            src="/images/home/session-image2.jpg"
                            alt={space.space_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex justify-end ">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSpace(space)}
                        >
                          <Edit3 />
                        </Button>
                        <Link href={`./spaces/${space.space_slug}/settings`}>
                          <Button variant="ghost" size="icon">
                            <Settings />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
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
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleEditSpace(space)}
                        variant={"outline"}
                      >
                        <Edit3 />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant={"outline"}>
                            {addDeleteSpaceLoading ? (
                              <Loader />
                            ) : (
                              <Trash2 className="" />
                            )}
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
                        <Button size="sm" variant={"outline"}>
                          <Settings />
                        </Button>
                      </Link>
                    </div>
                    <Link href={`./spaces/${space.space_slug}`}>
                      <div>
                        <CardTitle className="text-xl">
                          {space.space_name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {0} members
                        </CardDescription>
                      </div>
                    </Link>
                  </CardHeader>
                  <Link href={`./spaces/${space.space_slug}`}>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {space.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
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
