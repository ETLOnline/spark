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
import { Users } from "lucide-react"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { spaceStaticFeatures } from "./constants"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import Avvvatars from "avvvatars-react"

interface Props {
  space: SelectSpace
}

function SpaceSidebar({ space }: Props) {
  const pathname = usePathname()
  const pageType = useSearchParams()
  const { setOpen: setSideBarCollapse } = useSidebar()
  const [currentSpace, setCurrentSpace] = useAtom(spaceStore.currentSpace)
  const [spaceFeatures, setSpaceFeatures] = useState<SelectSpaceFeature[]>([])

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

  const canViewChat = permissionChecker
    ? permissionChecker.canAccess("chat.view")
    : false
  const canViewPost = permissionChecker
    ? permissionChecker.canAccess("posting.view")
    : false
  const canViewFileSharing = permissionChecker
    ? permissionChecker.canAccess("file_sharing.create")
    : false
  const canViewProject = permissionChecker
    ? permissionChecker.canAccess("project.view")
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
    return `/channels/${space.channel?.channel_slug}/spaces/${space.space_slug}?page-type=${feature_slug}`
  }
  // /channels/etl-online/spaces/test

  return (
    <SidebarGroup className="p-0">
      {/* <SidebarGroupLabel>{space.space_name}</SidebarGroupLabel> */}
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Space Name */}
          <SidebarMenuButton size={"lg"}>
            <div className="flex aspect-square items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Avvvatars value={space.space_name} size={40} style="shape" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate  font-semibold color-accent">
                {space.space_name}
              </span>
              <div></div>
              <span className="truncate flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {space.users?.length || 0} members
              </span>
            </div>
          </SidebarMenuButton>

          {/* space overview */}
          <Link
            href={`/channels/${space.channel?.channel_slug}/spaces/${space.space_slug}`}
          >
            <SidebarMenuItem
              className={`flex flex-row items-center gap-2 p-2 rounded
               ${
                 !pageType.get("page-type") &&
                 pathname ===
                   `/channels/${space.channel?.channel_slug}/spaces/${space.space_slug}`
                   ? "bg-sidebar-accent text-sidebar-accent-foreground"
                   : "hover:bg-sidebar-accent"
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
               ${pageType.get("page-type") === feature.feature?.feature_slug ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent"}`}
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
          {spaceStaticFeatures.map((feature) => (
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
                 : "hover:bg-sidebar-accent"
             }`}
              >
                <DynamicIcon
                  name={feature.icon as IconName}
                  className="h-4 w-4"
                />
                {feature.name}
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default SpaceSidebar
