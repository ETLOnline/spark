import React, { ReactNode } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/src/components/ui/hover-card"
import Link from "next/link"
import { Button } from '@/src/components/ui/button'
import { Calendar, Settings, Users } from 'lucide-react'
import { GetProjectByIdAction } from '@/src/server-actions/ProjectManagement/projectManagement'
import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import { Sidebar, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarProvider } from '@/src/components/ui/sidebar'
import ProjectSidebar from '../components/projectSidebar'
import { GetTaskStatusAction } from '@/src/server-actions/Tasks/Task'
import { ScrollArea } from '@/src/components/ui/scroll-area'

interface Props {
  children: ReactNode
  params: Promise<{ id: string }>
}


async function layout({ children, params }: Props) {


  const { id } = await params
  const projectId = id

  const currProject = await GetProjectByIdAction(projectId)

  if (!currProject.success || !currProject.data) {
    return (
      <NotFound />
    )
  }
  const currentProject = currProject.data

  const projectStatusList = await GetTaskStatusAction(projectId)




  return (
    <div className='grid grid-cols-12'>
      <div className='col-span-2 border-r p-2 pl-0'>
        <ProjectSidebar currProject={currentProject} statusList={projectStatusList.data ?? []} />
      </div>

      <div className='col-span-10'>
        <div className="grid grid-cols-1 ">
          <ScrollArea className='max-h-screen p-4'>
            {children}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default layout