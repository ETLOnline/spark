"use client"

import { SelectChannel } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { DeleteChannelAction } from "@/src/server-actions/Channel/Channel"
import { channelStore } from "@/src/store/channel/channelStore"
import { useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { Edit, Layout, MoreHorizontal, Trash2, User } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface ChannelProps {
  channel: SelectChannel
}

const ChannelsContextMenu: React.FC<ChannelProps> = ({ channel }) => {
  const router = useRouter()

  const setChannels = useSetAtom(channelStore.channels)
  const setSelectedChannel = useSetAtom(channelStore.selectedChannel)
  const setChannelFormModelVisibility = useSetAtom(
    channelStore.channelformModalVisibility
  )

  const { toast } = useToast()

  const [
    addDeleteChannelLoading,
    addDeleteChannelData,
    addDeleteChannelError,
    DeleteChannel
  ] = useServerAction(DeleteChannelAction)

  function editChannel(channel: SelectChannel) {
    setSelectedChannel(channel)
    setChannelFormModelVisibility(true)
  }

  async function handleDeleteChannel(channel: SelectChannel) {
    const deletedChannel = await DeleteChannel(channel as SelectChannel)
    if (deletedChannel?.success) {
      setChannels((preChannels) =>
        preChannels.filter((c) => c.id !== channel.id)
      )
      setChannelFormModelVisibility(false)
      toast({
        title: "Channel deleted successfully",
        duration: 3000
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            router.push(`/channels/${channel.channel_slug}/spaces`)
          }
        >
          <Layout className="mr-2 h-4 w-4" />
          View Spaces
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => editChannel(channel)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/channels/${channel.channel_slug}/users`)}>
          <User className="mr-2 h-4 w-4" />
          Users
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => handleDeleteChannel(channel)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ChannelsContextMenu
