import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { SelectSpace, SelectSpaceFeature } from "@/src/db/schema"
import {
  CircleCheckBig,
  Clock,
  LayoutDashboard,
  Share,
  UserPlus,
  Users
} from "lucide-react"
import React, { useEffect, useState } from "react"
import Tiptap from "@/src/components/common/Tiptap/TiptapRichEditor"
import "@/src/components/common/Tiptap/RichEditorFormat.css"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateSpaceAction } from "@/src/server-actions/Space/Space"
import { toast } from "@/src/hooks/use-toast"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import CreateShortcut from "@/src/components/common/Shortcut/components/CreateShortcut"
import StarterKit from "@tiptap/starter-kit"
import { Editor } from "@tiptap/react"
import { GetSpaceURL, normalizeHTML } from "@/src/utils/helpers"
import { useAtomValue } from "jotai"
import { onlineUsersStore } from "@/src/store/onlineUsers/onlineUsersStore"
import { AddRewardAction } from "@/src/server-actions/Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { auth } from "@clerk/nextjs/server"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { userStore } from "@/src/store/user/userStore"

interface SpaceOverviewProps {
  features?: SelectSpaceFeature[]
  hasAnyFeatureAccess: boolean
  space: SelectSpace
}

function SpaceOverview({
  features,
  hasAnyFeatureAccess,
  space
}: SpaceOverviewProps) {
  const [isEditDetail, setIsEditDetail] = useState(false)
  const [content, setContent] = useState("")
  const OnlineSpaceUsersCount = useAtomValue(onlineUsersStore.spaceOnlineUsers)
  const authUser = useAtomValue(userStore.AuthUser)

  const [overviewLoading, , , updatespaceDetails] =
    useServerAction(UpdateSpaceAction)

  const encodedChannelSlug = encodeURIComponent(
    space.channel?.channel_slug ?? ""
  )
  const encodedSpaceSlug = encodeURIComponent(space.space_slug)

  useEffect(() => {
    if (space.overview) {
      setContent(space.overview)
    }
  }, [space])

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )

  const canEditDetails = permissionChecker
    ? permissionChecker.canAccess("space.update")
    : false

  const handleEditDetails = async () => {
    try {
      if (content) {
        const response = await updatespaceDetails(space.id, {
          overview: content
        })
        if (response?.success && response?.data) {
          const spaceURL = GetSpaceURL(
            space.channel?.channel_slug || "",
            space.space_slug
          )

          await AddRewardAction(
            ActivityTypes.SpaceOverviewUpdate,
            authUser?.unique_id || "",
            spaceURL,
            {
              space_id: space.id,
              channel_id: space.channel?.id,
              community_id: space.channel?.community_id
            },
            undefined,
            "space_id",
            space.id
          )

          toast({
            title: "Overview updated successfully",
            description: "Your space overview has been updated.",
            duration: 3000
          })
          setIsEditDetail(false)
        }
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        duration: 3000
      })
    }
  }

  return (
    <div className="w-full">
      <div className="bg-background border-b px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            Overview
          </h1>
        </div>
        <div className="shrink-0">
          <CreateShortcut
            type="space"
            entity={{
              slug: `${encodedChannelSlug}/spaces/${encodedSpaceSlug}`,
              title: `${space?.space_name}`,
              entity_id: space?.id
            }}
          />
        </div>
      </div>

      <div className="flex flex-col overflow-auto w-full">
        <div className="flex items-center justify-between border-b p-4 sm:px-6">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">
              Space Details
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Space overview and information
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-6 w-full">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full">
                  <div className="flex items-center gap-2 text-muted-foreground w-full sm:w-auto">
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      {space.users?.length || 0}
                    </span>
                    <span className="text-sm">members</span>
                  </div>
                  {hasAnyFeatureAccess && (
                    <div className="flex items-center gap-2 text-muted-foreground w-full sm:w-auto">
                      <CircleCheckBig className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="font-medium text-foreground">
                        {features?.length || 0}
                      </span>
                      <span className="text-sm">active features</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground w-full sm:w-auto">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-medium text-foreground">
                      {OnlineSpaceUsersCount}
                    </span>
                    <span className="text-sm">
                      active {OnlineSpaceUsersCount === 1 ? "user" : "users"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 sm:space-y-8 rich-editor w-full overflow-hidden">
            <div className="w-full">
              {isEditDetail ? (
                canEditDetails ? (
                  <div className="space-y-4 w-full">
                    <Tiptap value={content} onChange={setContent} />
                    <div className="flex justify-end">
                      <Button
                        className="w-full sm:w-auto"
                        onClick={() => handleEditDetails()}
                        loading={overviewLoading}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : null
              ) : canEditDetails ? (
                <Card
                  className="p-4 cursor-pointer overflow-x-auto w-full"
                  onClick={() => setIsEditDetail(true)}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: normalizeHTML(content) ?? ""
                    }}
                    className="break-words overflow-y-auto w-min prose dark:prose-invert max-w-none"
                  />
                </Card>
              ) : (
                <Card className="p-4 overflow-x-auto w-full">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: normalizeHTML(content) ?? ""
                    }}
                    className="break-words overflow-y-auto w-min prose dark:prose-invert max-w-none"
                  />
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpaceOverview
