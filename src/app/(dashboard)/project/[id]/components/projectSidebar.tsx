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
import { InsertTaskStatus, SelectProject, SelectSpace } from "@/src/db/schema"
import { useAtom, useSetAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { ProjectManagementPages } from "@/src/components/Dashboard/ProjectManagement/constants/projectManagment"
import { navStore } from "@/src/store/nav/navStore"
import { getProjectCrumbsMapped } from "@/src/components/Dashboard/Sidebar.tsx/utils/helpers"

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

  const { setOpen: setSideBarCollapse } = useSidebar()

  const router = useRouter()

  const pathName = usePathname()
  const parts = pathName.split("/")
  const currPath = parts[parts.length - 1]

  useEffect(() => {
    setSideBarCollapse(false)
  }, [])

  useEffect(() => {
    if (statusList) {
      setProjectStatusList(statusList)
    }
  }, [statusList])

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
          {ProjectManagementPages.map((page) => (
            <Link href={`.${page.link}`} key={page.key}>
              <SidebarMenuItem
                className={`flex flex-row items-center gap-2 p-2 rounded
             ${pathName.includes(page.link) ? "bg-muted" : "hover:bg-muted"}`}
              >
                <DynamicIcon name={page.icon as IconName} className="h-4 w-4" />
                {page.title}
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default ProjectSidebar
