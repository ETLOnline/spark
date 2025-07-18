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
import Tiptap from "@/src/components/common/TiptapRichEditor"
import "@/src/components/common/RichEditorFormat.css"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateSpaceAction } from "@/src/server-actions/Space/Space"
import { toast } from "@/src/hooks/use-toast"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface SpaceOverviewProps {
  features?: SelectSpaceFeature[]
  space: SelectSpace
}

function SpaceOverview({ features, space }: SpaceOverviewProps) {
  const [isEditDetail, setIsEditDetail] = useState(false)
  const [content, setContent] = useState("")

  const [overviewLoading, , , updatespaceDetails] =
    useServerAction(UpdateSpaceAction)

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
    <div>
      <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" />
          <h1 className="text-xl font-semibold">Overview</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col   overflow-auto">
        {/* Space Details Section */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-semibold">Space Details</h2>
            <p className="text-sm text-muted-foreground">
              Space overview and information
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="flex flex-col gap-4 p-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-foreground">
                      {space.users?.length || 0}
                    </span>
                    <span className="text-sm">members</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CircleCheckBig className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-foreground">
                      {features?.length || 0}
                    </span>
                    <span className="text-sm">active features</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-blue-500 " />
                    <span className="font-medium text-foreground">{0}</span>
                    <span className="text-sm">active today</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Section */}
          <div className="space-y-8 rich-editor">
            <div>
              {isEditDetail ? (
                canEditDetails ? (
                  <div className="space-y-2">
                    <Tiptap value={content} onChange={setContent} />
                    <Button
                      className="float-right"
                      onClick={() => handleEditDetails()}
                      loading={overviewLoading}
                    >
                      Save
                    </Button>
                  </div>
                ) : null
              ) : canEditDetails ? (
                <Card
                  className="p-4 cursor-pointer"
                  onClick={() => setIsEditDetail(true)}
                  dangerouslySetInnerHTML={{
                    __html: content ?? ""
                  }}
                />
              ) : (
                <Card
                  className="p-4"
                  dangerouslySetInnerHTML={{
                    __html: content ?? ""
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpaceOverview
