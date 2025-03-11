"use client"

import { ArrowLeft, Edit, MoreHorizontal, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { useParams, useSearchParams } from "next/navigation"
import { SelectSpace } from "@/src/db/schema"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useEffect } from "react"
import CreateSpaceModal from "../../Spaces/CreateSpaceModal/CreateSpaceModal"
import { channelStore } from "@/src/store/chennel/channelStore"

type ChannelDetailsProps = {
  fetchedSpaces: SelectSpace[]
}

export default function ChannelDetails({ fetchedSpaces }: ChannelDetailsProps) {
  const [spaces, setSpaces] = useAtom(spaceStore.spaces)
  const selectedChannel = useAtomValue(channelStore.selectedChannel)

  const params = useParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    setSpaces(fetchedSpaces)
  }, [fetchedSpaces])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link href="/channels" className="mr-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-lg font-semibold sm:text-xl">Channels</h1>
      </header>
      <div className="relative h-40 sm:h-56 w-full">
        <Image
          src="/images/channels/channel_sample_image.jpg"
          alt="Sample image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {selectedChannel?.channel_name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-background/20 border-white/20 text-white hover:bg-background/30"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit Channel
            </Button>
          </div>
        </div>
      </div>
      <main className="flex-1 p-4 sm:p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold">
              Spaces in {selectedChannel?.channel_name}
            </h2>
            <CreateSpaceModal
            />
          </div>
          {/* Desktop view */}
          <div className="hidden sm:block">
            <div className="rounded-lg border bg-card">
              <div className="grid grid-cols-[1fr_100px_150px_120px_50px] gap-4 p-4 font-medium">
                <div>Space</div>
              </div>
              {spaces.map((space) => (
                <Link
                  key={space.id}
                  href={`./${params.channel_slug}/spaces/${space.space_slug}`}
                >
                  <div className="md:flex md:flex-wrap md:justify-between lg:grid lg:grid-cols-2 gap-4 items-center border-t p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                        <Image
                          src="/images/home/session-image2.jpg"
                          alt={space.space_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-medium">{space.space_name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {space.description}
                      </div>
                    </div>
                    <div className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Manage Members
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Space
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {/* Mobile view */}
          <div className="sm:hidden space-y-4">
            {spaces.map((space) => (
              <Link
                key={space.id}
                href={`./${params.channel_slug}/spaces/${space.space_slug}`}
              >
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
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
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete Space
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {space.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
