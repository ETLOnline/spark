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

interface Props {
  statusList: InsertTaskStatus[]
  currProject: SelectProject
}

function ProjectSidebar({ statusList, currProject }: Props) {
  const [projectStatusList, setProjectStatusList] = useAtom(
    projectStore.projectStatusList
  )

  const { setOpen: setSideBarCollapse } = useSidebar()

  const router = useRouter()

  const pathName = usePathname()

  useEffect(() => {
    setSideBarCollapse(false)
  }, [])

  useEffect(() => {
    if (statusList) {
      setProjectStatusList(statusList)
    }
  }, [statusList])

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
