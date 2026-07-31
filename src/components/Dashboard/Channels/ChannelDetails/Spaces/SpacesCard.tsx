import Link from "next/link"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { SelectSpace } from "@/src/db/schema"
import SpacesActionButtons from "./SpaceActionButtons"
import { Badge } from "@/src/components/ui/badge"
import { getSpaceBasePath } from "@/src/utils/helpers"
import { Button } from "@/src/components/ui/button"
import { ArrowRight, Check, Lock, PencilRuler } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { useEffect, useState } from "react"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface Props {
  space: SelectSpace
  setIsChannelMember?: React.Dispatch<React.SetStateAction<boolean>>
}

function SpacesCard({ space, setIsChannelMember }: Props) {
  const spaceHref = getSpaceBasePath(
    space.channel?.channel_slug,
    space.space_slug
  )
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )
  const canSpaceAllowAction = permissionChecker
    ? permissionChecker?.canAccess("space.allow.action")
    : false
  const canViewSpace = permissionChecker
    ? permissionChecker?.canAccess("space.view")
    : false
  const canUpdateSpace = permissionChecker
    ? permissionChecker?.canAccess("space.update")
    : false

  return (
    <Card key={space.id} className="overflow-hidden flex flex-col h-full ">
      {/* <div className="aspect-video w-full overflow-hidden">
        <img
          src={"/images/home/session-image2.jpg"}
          alt={space.space_name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div> */}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center gap-1">
            {space.space_name}
            {space.space_type === "private" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock
                      className="text-muted-foreground  self-start mt-2"
                      height={14}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Private</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {canUpdateSpace &&
              (space.publish_space ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Check
                        className="text-muted-foreground self-start mt-2"
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
                        className="text-muted-foreground self-start mt-2"
                        height={14}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Draft</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </CardTitle>
          {canSpaceAllowAction || space.space_type === "public" ? (
            <SpacesActionButtons
              space={space}
              setIsChannelMember={setIsChannelMember}
            />
          ) : null}
        </div>
        <CardDescription>{space.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 mt-auto pt-3">
        {/* <Badge variant="secondary">
          {space.membersCount} {space.membersCount === 1 ? 'Member' : 'Members'}
          0 Members
        </Badge> */}
        <Link href={spaceHref}>
          <Button>
            Launch Space <ArrowRight />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default SpacesCard
