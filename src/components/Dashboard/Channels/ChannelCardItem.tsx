import { SelectChannel } from "@/src/db/schema"
import Link from "next/link"
import { Check, Globe, Hash, Layout, Lock, PencilRuler } from "lucide-react"
import ChannelsContextMenu from "./ChannelDetails/ChannelsContextMenu"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../../ui/tooltip"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface ChannelProps {
  channel: SelectChannel
  onActionComplete: (
    actionType: "create" | "updated" | "deleted",
    channel: SelectChannel
  ) => void
  setIsCommunityMember?: React.Dispatch<React.SetStateAction<boolean | null>>
}

function ChannelCardItem({
  channel,
  onActionComplete,
  setIsCommunityMember
}: ChannelProps) {
  const spacesCount = channel?.spaces ? channel.spaces.length : 0
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "CHANNEL",
    channel?.id
  )
  const canUpdateChannel = permissionChecker
    ? permissionChecker.canAccess("channel.update")
    : false
  const encodedChannelSlug = encodeURIComponent(channel.channel_slug)

  return (
    <div
      key={channel.id}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
    >
      {/* Main Content Area */}
      <Link
        className="flex items-center gap-3 flex-grow min-w-0"
        href={`/channels/${encodedChannelSlug}/spaces`}
      >
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <Hash className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex flex-col min-w-0 flex-grow">
            <span className="flex items-center gap-2 font-medium min-w-0">
              <span className="truncate">{channel.channel_name}</span>
              {/* for not publish or published */}
              {canUpdateChannel &&
                (channel.publish_channel ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Check className="text-muted-foreground" height={14} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Published</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PencilRuler
                          className="text-muted-foreground"
                          height={14}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Darft</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              {channel.channel_type === "public" ? (
                <Globe className="h-4 w-4 text-green-500 shrink-0" />
              ) : channel.channel_type === "private" ? (
                <Lock className="h-4 w-4 text-yellow-500 shrink-0" />
              ) : null}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {channel.description || "No description available"}
            </span>
          </div>
          {/* Channel Stats (still part of the content, but aligned to the right within this section) */}
          <div className="flex flex-col items-end whitespace-nowrap text-right text-sm text-muted-foreground ml-4">
            <div className="text-xs">
              {channel.created_at
                ? new Date(channel.created_at).toLocaleString("default", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })
                : "N/A"}
            </div>
            <div className="text-xs mt-0.5">
              {(channel.users as Array<any>)?.length ?? 0} members
            </div>
          </div>
        </div>
      </Link>
      {/* Action Menu Area */}
      <div className="flex items-center ml-4 w-8 justify-end">
        <ChannelsContextMenu
          channel={channel}
          onActionComplete={onActionComplete}
          setIsCommunityMember={setIsCommunityMember}
        />
      </div>
    </div>
  )
}

export default ChannelCardItem
