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
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { spaceStaticFeatures } from "./constants"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import Avvvatars from "avvvatars-react"
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
  const [joinLoading, , , joinSpace] = useServerAction(AttachSpaceUserAction)
  const [leaveLoading, , , leaveSpace] = useServerAction(LeaveSpaceAction)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSpaceMember, setIsSpaceMember] = useState<boolean>(false)

  useEffect(() => {
    if (currentUserId !== undefined) {
      setIsSpaceMember(isEntityUser(space, currentUserId as string))
      setIsLoading(false)
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
          setIsSpaceMember(false)
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

    return () => {
      setCurrentSpace(null)
    }
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

  const canViewChat = permissionChecker?.canAccess("space.chat.view") ?? false
  const canViewPost =
    permissionChecker?.canAccess("space.posting.view") ?? false
  const canViewFileSharing =
    permissionChecker?.canAccess("space.file_sharing.create") ?? false
  const canViewProject =
    permissionChecker?.canAccess("space.project.view") ?? false
  const canViewSetting =
    permissionChecker?.canAccess("space.setting.update") ?? false

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
        return false
    }
  }

  const accessibleFeatures = spaceFeatures.filter(({ feature }) => {
    if (!feature) return false
    return hasFeaturePermission(feature.feature_slug)
  })

  function getFeatureUrl(feature_slug: string) {
    return `/channels/${encodedChannelSlug}/spaces/${encodedSpaceSlug}?page-type=${feature_slug}`
  }

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupContent>
        <SidebarMenu>
          {/* 1. Space Name (Cleaned up) */}
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
                {/* Cleaned up space name */}
                <span className="font-semibold text-sm">
                  {space.space_name}
                </span>
              </div>
            </div>
          </SidebarMenuButton>
          {/* Responsive Member Info & Action Area */}
          <div className="px-4 py-2 border-b border-sidebar-border/50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Member Count - allows shrinking */}
              <span className="flex items-center gap-1 text-xs text-sidebar-foreground/70">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span>{space.users?.length || 0} members</span>
              </span>

              {/* Join/Leave Button - prevents shrinking */}
              {!isSuperAdmin && (
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <span className="text-xs text-gray-500 rounded-md whitespace-nowrap">
                      Loading...
                    </span>
                  ) : isSpaceMember ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!leaveLoading) handleLeaveSpace()
                      }}
                      className={`leave-btn flex items-center text-xs font-medium cursor-pointer rounded-md px-2 py-1 transition-colors hover:bg-red-500/10 hover:text-red-500 whitespace-nowrap ${
                        leaveLoading
                          ? "text-gray-500 cursor-not-allowed opacity-50"
                          : "text-red-400"
                      }`}
                    >
                      <LogOut className="mr-1 h-3 w-3 flex-shrink-0" />
                      {leaveLoading ? "Leaving..." : "Leave"}
                    </span>
                  ) : (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!joinLoading) handleJoinSpace()
                      }}
                      className={`inline-flex items-center rounded-md border border-sidebar-accent bg-sidebar-accent/10 px-3 py-1 text-xs font-medium ring-offset-background transition-colors whitespace-nowrap ${
                        joinLoading
                          ? "text-gray-500 cursor-not-allowed opacity-50"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      }`}
                    >
                      <PlusCircle className="mr-1 h-3 w-3 flex-shrink-0" />
                      {joinLoading ? "Joining..." : "Join"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

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
            if (feature.name === "Settings" && !canViewSetting) return null
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
