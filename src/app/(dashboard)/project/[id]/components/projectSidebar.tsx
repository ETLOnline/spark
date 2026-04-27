"use client"
import React, { useEffect, useState } from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar
} from "@/src/components/ui/sidebar"

import { useParams, usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { InsertTaskStatus, SelectProject, SelectSpace } from "@/src/db/schema"
import { useAtom, useSetAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { ProjectManagementPages } from "@/src/components/Dashboard/ProjectManagement/constants/projectManagment"
import { navStore } from "@/src/store/nav/navStore"
import { getProjectCrumbsMapped } from "@/src/components/Dashboard/Sidebar.tsx/utils/helpers"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import CreateShortcut from "@/src/components/common/Shortcut/components/CreateShortcut"
import Loader from "@/src/components/common/Loader/Loader"
import pusherClient from "@/src/services/realtime/PusherClient"
import { spaceStore } from "@/src/store/space/spaceStore"

interface Props {
  statusList: InsertTaskStatus[]
  currProject: SelectProject
  currSpace?: SelectSpace
}

function ProjectSidebar({ statusList, currProject, currSpace }: Props) {
  const [projectStatusList, setProjectStatusList] = useAtom(
    projectStore.projectStatusList
  )
  const setCrumbRoutes = useSetAtom(navStore.crumbRoutes)
  const setPusherChannel = useSetAtom(projectStore.pusherChannel)
  const setCurrSpace = useSetAtom(spaceStore.currentSpace)
  const setcurrProject = useSetAtom(projectStore.currProject)

  const { setOpen: setSideBarCollapse } = useSidebar()
  const pathName = usePathname()
  const parts = pathName.split("/")
  const currPath = parts[parts.length - 1]

  // Initialize permissionsLoaded to false, it will become true once permissionChecker is ready
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    currProject?.id
  )

  useEffect(() => {
    if (currProject) setcurrProject(currProject)
  }, [currProject])

  useEffect(() => {
    if (currSpace) setCurrSpace(currSpace)
  }, [currSpace])

  useEffect(() => {
    const channel = pusherClient.subscribe(`project-${currProject?.id}-tasks`)

    if (channel) {
      setPusherChannel(channel)
    }

    return () => {
      pusherClient.unsubscribe(`project-${currProject?.id}-tasks`)
    }
  }, [])

  useEffect(() => {
    setSideBarCollapse(false)
  }, [])

  useEffect(() => {
    if (statusList) {
      setProjectStatusList(statusList)
    }
  }, [statusList, setProjectStatusList])

  useEffect(() => {
    if (permissionChecker) {
      setPermissionsLoaded(true)
    }
  }, [permissionChecker])

  useEffect(() => {
    setCrumbRoutes((prev) => {
      const newCrumb = getProjectCrumbsMapped(
        [currProject],
        currPath,
        currSpace
      )
      return [...prev, ...(Array.isArray(newCrumb) ? newCrumb : [newCrumb])]
    })
  }, [currProject, currSpace, currPath])

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>{currProject.project_name}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {permissionsLoaded ? (
            ProjectManagementPages.map((page) => {
              const requiredPermission = `project.${page.key.toLowerCase()}.view`
              const canViewPage =
                permissionChecker?.canAccess(requiredPermission) || false

              if (!canViewPage) {
                return null
              }

              return (
                <Link
                  href={`/project/${currProject.id}/${page.key}`}
                  key={page.key}
                >
                  <SidebarMenuItem
                    className={`flex flex-row items-center gap-2 p-2 rounded
                    ${pathName.includes(page.key) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                  >
                    <DynamicIcon
                      name={page.icon as IconName}
                      className="h-4 w-4"
                    />
                    {page.title}
                  </SidebarMenuItem>
                </Link>
              )
            })
          ) : (
            <SidebarMenuItem className="p-2 text-sm text-gray-500">
              <Loader />
            </SidebarMenuItem>
          )}
          <div className="mt-6 w-full flex flex-col gap-2">
            <SidebarSeparator />
            <CreateShortcut
              type="project"
              entity={{
                slug: currProject?.id ?? "",
                title: `${currProject?.project_name}`,
                entity_id: currProject?.id ?? ""
              }}
            />
          </div>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default ProjectSidebar
