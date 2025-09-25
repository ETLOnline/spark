"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/src/components/ui/sidebar"
import { SelectSpace, SelectSpaceFeature } from "@/src/db/schema"
import { LogOut, PlusCircle, Users } from "lucide-react"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { spaceStaticFeatures } from "./constants"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import Avvvatars from "avvvatars-react"
import { Button } from "@/src/components/ui/button"
import { userStore } from "@/src/store/user/userStore"
import { isEntityUser } from "@/src/utils/clientHelper"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AttachSpaceUserAction,
  LeaveSpaceAction
} from "@/src/server-actions/Space/Space"
import { useToast } from "@/src/hooks/use-toast"
import "./../../../../../../style.css"

interface Props {
  space: SelectSpace
}

function SpaceSidebar({ space }: Props) {
  const pathname = usePathname()
  const pageType = useSearchParams()
  const { setOpen: setSideBarCollapse } = useSidebar()
  const [currentSpace, setCurrentSpace] = useAtom(spaceStore.currentSpace)
  const [spaceFeatures, setSpaceFeatures] = useState<SelectSpaceFeature[]>([])
  const { toast } = useToast()
  const router = useRouter()
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const [joinLoading, joinResult, joinError, joinSpace] = useServerAction(
    AttachSpaceUserAction
  )
  const [leaveLoading, leaveResult, leaveError, leaveSpace] =
    useServerAction(LeaveSpaceAction)
  const [isSpaceMember, setIsSpaceMember] = useState<boolean>(false)

  useEffect(() => {
    const isMember = isEntityUser(space, currentUserId as string)

    if (isMember) setIsSpaceMember(true)
    else {
      setIsSpaceMember(false)
    }
  }, [space, currentUserId])

  const handleJoinSpace = async () => {
    if (space.id && currentUserId) {
      try {
        const res = await joinSpace(space.id, currentUserId)

        if (res?.success) {
          setIsSpaceMember(true)
          toast({
            title: "Space Joined",
            description: "You have successfully joined the Space!",
            duration: 3000
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          duration: 3000
        })
      }
    }
  }

  const handleLeaveSpace = async () => {
    if (space.id && currentUserId) {
      try {
        const res = await leaveSpace(space.id, currentUserId)

        if (res?.success) {
          toast({
            title: "Space Left",
            description: "You have successfully left the Space!",
            duration: 3000
          })

          const encodedChannelSlug = encodeURIComponent(
            space.channel?.channel_slug ?? ""
          )
          router.push(`/channels/${encodedChannelSlug}/spaces`)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred while leaving the Space.",
          duration: 3000
        })
      }
    }
  }

  useEffect(() => {
    setSideBarCollapse(false)
    setCurrentSpace(space)
  }, [space])

  useEffect(() => {
    setSpaceFeatures(currentSpace?.features || [])
  }, [currentSpace])

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )

  const encodedSpaceSlug = encodeURIComponent(space.space_slug)
  const encodedChannelSlug = encodeURIComponent(
    space.channel?.channel_slug ?? ""
  )

  const canViewChat = permissionChecker
    ? permissionChecker.canAccess("space.chat.view")
    : false
  const canViewPost = permissionChecker
    ? permissionChecker.canAccess("space.posting.view")
    : false
  const canViewFileSharing = permissionChecker
    ? permissionChecker.canAccess("space.file_sharing.create")
    : false
  const canViewProject = permissionChecker
    ? permissionChecker.canAccess("space.project.view")
    : false
  const canViewSetting = permissionChecker
    ? permissionChecker.canAccess("space.setting.update")
    : false

  const hasFeaturePermission = (featureSlug: string): boolean => {
    switch (featureSlug) {
      case "posts":
        return canViewPost
      case "file-sharing":
        return canViewFileSharing
      case "project-management":
        return canViewProject
      case "chat":
        return canViewChat
      default:
        return false // Default to no access for unknown features
    }
  }

  const accessibleFeatures = spaceFeatures.filter(({ feature }) => {
    if (!feature) return false
    return hasFeaturePermission(feature.feature_slug)
  })

  function getFeatureUrl(feature_slug: string) {
    return `/channels/${encodedChannelSlug}/spaces/${encodedSpaceSlug}?page-type=${feature_slug}`
  }
  // /channels/etl-online/spaces/test

  return (
    <SidebarGroup className="p-0">
      {/* <SidebarGroupLabel>{space.space_name}</SidebarGroupLabel> */}
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Space Name */}
          <SidebarMenuButton
            size={"lg"}
            className="hover:bg-transparent hover:text-sidebar-foreground"
          >
            <div className="flex items-center gap-3 w-full">
              {/* Avatar */}
              <div className="flex aspect-square items-center justify-center rounded-lg text-sidebar-primary-foreground flex-shrink-0">
                <Avvvatars value={space.space_name} size={40} style="shape" />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 ">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="truncate font-semibold text-sm">
                    {space.space_name}
                  </span>
                  {!isSuperAdmin && (
                    <>
                      {isSpaceMember ? (
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            // Only handle click if not disabled
                            if (!leaveLoading) {
                              handleLeaveSpace()
                            }
                          }}
                          className={`leave-btn${leaveLoading ? " disabled" : ""}`}
                        >
                          <LogOut className="mr-2 h-3 w-3" />
                          {leaveLoading ? "Leaving..." : "Leave"}
                        </span>
                      ) : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            // Only handle click if not disabled
                            if (!joinLoading) {
                              handleJoinSpace()
                            }
                          }}
                          className={`inline-flex items-center rounded-md border  bg-background px-3 py-1 text-xs font-medium ring-offset-background transition-colors ${
                            joinLoading
                              ? "text-gray-500 cursor-not-allowed opacity-50"
                              : " hover:bg-primary hover:text-primary-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          }`}
                        >
                          <PlusCircle className="mr-2 h-3 w-3" />
                          {joinLoading ? "Joining..." : "Join"}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <span className="truncate flex items-center gap-1 text-xs hover:text-sidebar-accent-foreground">
                  <Users className="h-3 w-3" />
                  {space.users?.length || 0} members
                </span>
              </div>
            </div>
          </SidebarMenuButton>

          {/* space overview */}
          <Link
            href={`/channels/${encodedChannelSlug}/spaces/${encodedSpaceSlug}`}
          >
            <SidebarMenuItem
              className={`flex flex-row items-center gap-2 p-2 rounded
               ${
                 !pageType.get("page-type") &&
                 pathname ===
                   `/channels/${encodedChannelSlug}/spaces/${encodedSpaceSlug}`
                   ? "bg-sidebar-accent text-sidebar-accent-foreground"
                   : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
               }`}
            >
              <DynamicIcon name="layout-dashboard" className="h-4 w-4" />
              Overview
            </SidebarMenuItem>
          </Link>

          {/* dynamic space features */}
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          {accessibleFeatures.length > 0 ? (
            accessibleFeatures.map((feature) => (
              <Link
                key={feature.feature?.feature_slug}
                href={
                  feature
                    ? getFeatureUrl(feature.feature?.feature_slug ?? "")
                    : "#"
                }
              >
                <SidebarMenuItem
                  className={`flex flex-row items-center gap-2 p-2 rounded
               ${
                 pageType.get("page-type") === feature.feature?.feature_slug
                   ? "bg-sidebar-accent text-sidebar-accent-foreground"
                   : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
               }`}
                >
                  <DynamicIcon
                    name={feature.feature?.feature_icon as IconName}
                    className="h-4 w-4"
                  />
                  {feature.feature?.feature_name}
                </SidebarMenuItem>
              </Link>
            ))
          ) : (
            <SidebarMenuItem className="p-2 text-sm text-gray-500">
              No features available
            </SidebarMenuItem>
          )}

          {/* Static Features */}

          <SidebarGroupLabel>Other</SidebarGroupLabel>
          {spaceStaticFeatures.map((feature) => {
            if (feature.name === "Settings" && !canViewSetting) {
              return null
            }
            return (
              <Link
                key={feature.slug}
                href={feature ? getFeatureUrl(feature.slug ?? "") : "#"}
              >
                <SidebarMenuItem
                  className={`flex flex-row items-center gap-2 p-2 rounded
          ${
            pathname.includes(`${feature.slug}`) ||
            pageType.get("page-type") === feature.slug
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
                >
                  <DynamicIcon
                    name={feature.icon as IconName}
                    className="h-4 w-4"
                  />
                  {feature.name}
                </SidebarMenuItem>
              </Link>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default SpaceSidebar
