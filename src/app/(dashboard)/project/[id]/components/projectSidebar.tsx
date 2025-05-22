'use client'
import React, { useEffect, useState } from 'react'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarProvider, useSidebar } from '@/src/components/ui/sidebar'
import { ChartGantt, Files, ListTodo, PictureInPicture2, Settings, SquareKanban, Users } from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { InsertTaskStatus, SelectProject } from '@/src/db/schema'
import { useAtom } from 'jotai'
import { projectStore } from '@/src/store/project/projectStore'

interface Props {
  statusList: InsertTaskStatus[]
  currProject: SelectProject
}

function ProjectSidebar({ statusList, currProject }: Props) {

  const [projectStatusList, setProjectStatusList] = useAtom(projectStore.projectStatusList)
  // const [activeTab, setActiveTab] = useState<string | null>(null)

  const { setOpen: setSideBarCollapse } = useSidebar()

  const router = useRouter()

  const pathName = usePathname()

  const getActiveTab = () => {
    if (pathName.includes('/overview')) return 'overview'
    if (pathName.includes('/sprint')) return 'sprint'
    if (pathName.includes('/board')) return 'board'
    if (pathName.includes('/backlog')) return 'backlog'
    if (pathName.includes('/files')) return 'files'
    if (pathName.includes('/settings')) return 'settings'
    if (pathName.includes('/teams')) return 'teams'
    return null
  }

  const activeTab = getActiveTab()

  useEffect(() => {
    setSideBarCollapse(false)
  }, [])


  useEffect(() => {
    if (statusList) {
      setProjectStatusList(statusList)
    }
  }, [statusList])

  return (
    <SidebarGroup className='p-0'>
      <SidebarGroupLabel >{currProject.project_name}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <Link href={`./overview`} >
            <SidebarMenuItem className={`flex flex-row items-center gap-2 p-2 rounded
              ${activeTab === "overview" ? "bg-muted" : "hover:bg-muted"}`}>
              <PictureInPicture2 className='h-4 w-4' />
              Overview
            </SidebarMenuItem>
          </Link>
          <Link href={`./sprint`} >
            <SidebarMenuItem className={`flex flex-row items-center gap-2 p-2 rounded
              ${activeTab === "sprint" ? "bg-muted" : "hover:bg-muted"}`}>
              <ChartGantt className='h-4 w-4' />
              Sprints
            </SidebarMenuItem>
          </Link>
          <Link href={`./board`} >
            <SidebarMenuItem className={`flex flex-row items-center gap-2 p-2 rounded
              ${activeTab === "board" ? "bg-muted" : "hover:bg-muted"}`}>
              <SquareKanban className='h-4 w-4' />
              Board
            </SidebarMenuItem>
          </Link>
          <Link href={`./backlog`} >
            <SidebarMenuItem className={`flex flex-row items-center gap-2 p-2 rounded
              ${activeTab === "backlog" ? "bg-muted" : "hover:bg-muted"}`}>
              <ListTodo className='h-4 w-4' />
              Backlog
            </SidebarMenuItem>
          </Link>
          <Link href={`./files`} >
            <SidebarMenuItem className={`flex flex-row items-center gap-2 p-2 rounded
              ${activeTab === "files" ? "bg-muted" : "hover:bg-muted"}`}>
              <Files className='h-4 w-4' />
              Files
            </SidebarMenuItem>
          </Link>
          <Link href={`#`} >
            <SidebarMenuItem className={`flex flex-row items-center gap-2 p-2 rounded
              ${activeTab === "teams" ? "bg-muted" : "hover:bg-muted"}`}>
              <Users className='h-4 w-4' />
              Teams
            </SidebarMenuItem>
          </Link>
          <Link href={`./settings`} >
            <SidebarMenuItem className={`flex flex-row items-center gap-2 p-2 rounded
              ${activeTab === "settings" ? "bg-muted" : "hover:bg-muted"}`}>
              <Settings className='h-4 w-4' />
              Settings
            </SidebarMenuItem>
          </Link>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default ProjectSidebar