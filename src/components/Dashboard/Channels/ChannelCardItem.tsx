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
        className="flex-1 min-w-0"
        href={`/channels/${encodedChannelSlug}/spaces`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Hash className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            {/* Name + icons row */}
            <span className="flex items-center gap-2 font-medium min-w-0">
              <span className="truncate">{channel.channel_name}</span>
              {canUpdateChannel &&
                (channel.publish_channel ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Check
                          className="text-muted-foreground shrink-0"
                          height={14}
                        />
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
                          className="text-muted-foreground shrink-0"
                          height={14}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Draft</p>
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
            {/* Description */}
            <span className="text-xs text-muted-foreground mt-0.5 truncate">
              {channel.description || "No description available"}
            </span>
            {/* Stats below on mobile */}
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>
                {channel.created_at
                  ? new Date(channel.created_at).toLocaleString("default", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  : "N/A"}
              </span>
              <span>·</span>
              <span>{(channel.users as Array<any>)?.length ?? 0} members</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Menu */}
      <div className="flex items-center ml-2 shrink-0">
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
