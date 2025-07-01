"use client"
import React, { useEffect, useState } from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar
} from "@/src/components/ui/sidebar"
import {
  ChartGantt,
  Files,
  ListTodo,
  PictureInPicture2,
  Settings,
  SquareKanban,
  Users
} from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { InsertTaskStatus, SelectProject } from "@/src/db/schema"
import { useAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { ProjectManagementPages } from "@/src/components/Dashboard/ProjectManagement/constants/projectManagment"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface Props {
  statusList: InsertTaskStatus[]
  currProject: SelectProject
}

function ProjectSidebar({ statusList, currProject }: Props) {
  const [projectStatusList, setProjectStatusList] = useAtom(
    projectStore.projectStatusList
  )
  const { setOpen: setSideBarCollapse } = useSidebar()
  const pathName = usePathname()

  // Initialize permissionsLoaded to false, it will become true once permissionChecker is ready
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    currProject?.id
  )

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
                <Link href={`.${page.link}`} key={page.key}>
                  <SidebarMenuItem
                    className={`flex flex-row items-center gap-2 p-2 rounded
                    ${pathName.includes(page.link) ? "bg-muted" : "hover:bg-muted"}`}
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
              Loading navigation...
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default ProjectSidebar
