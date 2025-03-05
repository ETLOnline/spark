"use client"

import { useState } from "react"
import { ArrowLeft, Edit, MoreHorizontal, Plus, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { useParams } from "next/navigation"


const initialSpaces = [
  {
    id: 1,
    name: "Campaign Planning",
    description: "Collaborative space for planning our upcoming marketing campaigns",
    type: "Project",
    members: 8,
    status: "active",
    lastActive: "2 mins ago",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Content Creation",
    description: "Space for creating and reviewing marketing content",
    type: "Team",
    members: 12,
    status: "active",
    lastActive: "1 hour ago",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Market Research",
    description: "Collecting and analyzing market trends and competitor activities",
    type: "Research",
    members: 6,
    status: "inactive",
    lastActive: "2 days ago",
    image: "/placeholder.svg?height=40&width=40",
  },
]

export default function ChannelDetails() {
  const [spaces, setSpaces] = useState(initialSpaces)
  const params = useParams();
  const channelName = decodeURIComponent(params.channel_name as string)

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
        <Image src="/images/channels/channel_sample_image.jpg" alt="Sample image" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{channelName}</h1>
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
            <h2 className="text-xl font-bold">Spaces in {channelName}</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Space
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Space</DialogTitle>
                  <DialogDescription>Set up a new space within the {channelName} channel.</DialogDescription>
                </DialogHeader>
                <form>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Space Name</Label>
                      < Input
                        id="name"
                        placeholder="Enter space name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter space description"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button className="w-full sm:w-auto">
                      Create Space
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block">
            <div className=" rounded-lg border bg-card">
              <div className="grid grid-cols-[1fr_100px_150px_120px_50px] gap-4 p-4 font-medium">
                <div>Space</div>
              </div>
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className="md:flex md:flex-wrap md:justify-between lg:grid lg:grid-cols-2 gap-4 items-center border-t p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                      <Image src="/images/home/session-image2.jpg" alt={space.name} fill className="object-cover" />
                    </div>
                    <Link href={`/channels/${encodeURIComponent(channelName)}/spaces`}>
                      <div className="font-medium">{space.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{space.description}</div>
                    </Link>
                  </div>
                  <div className="text-end">
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
                        <DropdownMenuItem className="text-destructive">Delete Space</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile view */}
          <div className="sm:hidden space-y-4">
            {spaces.map((space) => (
              <div key={space.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                      <Image src="/images/home/session-image2.jpg" alt={space.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">{space.name}</div>
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
                      <DropdownMenuItem className="text-destructive">Delete Space</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">{space.description}</div>

              </div>
            ))}
          </div>
        </div>

      </main>
    </div >
  )
}

