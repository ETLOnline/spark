import React, { ReactNode } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/src/components/ui/hover-card"
import Link from "next/link"
import { Button } from '@/src/components/ui/button'
import { Calendar, Settings, Users } from 'lucide-react'
import { GetProjectByIdAction } from '@/src/server-actions/ProjectManagement/projectManagement'
import NotFound from '@/src/components/Dashboard/NotFound/NotFound'

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





  return (
    <div className="grid grid-cols-1  p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{currentProject.project_name}</h1>
          <p className="text-muted-foreground">{currentProject.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Timeline
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Start Date</span>
                  <span className="text-sm font-semibold">2023-11-15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Target Date</span>
                  <span className="text-sm font-semibold text-primary">2024-03-20</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Link href={`./settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}

export default layout