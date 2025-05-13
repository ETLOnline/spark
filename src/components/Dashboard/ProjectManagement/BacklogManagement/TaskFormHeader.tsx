"use client"
import { SelectProject, SelectSpace, SelectTask } from '@/src/db/schema'
import { GetProjectByIdAction } from '@/src/server-actions/ProjectManagement/projectManagement'
import { GetSpaceByIdAction } from '@/src/server-actions/Space/Space'
import { projectStore } from '@/src/store/project/projectStore'
import { useAtom } from 'jotai'
import { ChevronRight, Home, SlashIcon, Ticket } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  selectedTask: SelectTask | null
}

function TaskFormHeader({ selectedTask }: Props) {
  const [project, setProject] = useAtom(projectStore.currProject)

  const [space, setSpace] = useState<SelectSpace>()


  const projectId = useParams().id as string

  useEffect(() => {
    const fetchProject = async () => {
      const projectData = await GetProjectByIdAction(projectId)
      if (projectData.success && projectData.data) {
        setProject(projectData.data)
      }
    }
    fetchProject()
  }, [projectId])


  useEffect(() => {
    const fetchSpace = async () => {
      const spaceData = await GetSpaceByIdAction(project?.space_id || "")
      if (spaceData.success && spaceData.data) {
        setSpace(spaceData.data)
      }
    }
    fetchSpace()
  }, [project])


  return (
    <header className=" border-b  px-4 py-3 flex items-center">
      <nav className="flex items-center text-sm">


        <Link href={space ? `/project?channel=${space?.channel?.channel_slug}&space=${space?.space_slug}` : "./board?tab=backlog"} className="text-gray-500 hover:text-gray-300">
          Projects
        </Link>

        <ChevronRight size={16} className="mx-2 text-gray-400" />

        <Link href={`/project/${project?.id}/board?tab=sprints`} className="text-gray-500 hover:text-gray-300">
          {project?.project_name}
        </Link>


        {
          selectedTask ?
            (
              <>
                <ChevronRight size={16} className="mx-2 text-gray-400" />
                <a target="_blank" href={`/project/${project?.id}/taskPage?task=${selectedTask.id}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-300">
                  <Ticket size={16} />
                  {selectedTask.task_num}
                </a  >
              </>
            ) : (
              null
            )
        }
      </nav>
    </header>

  )
}

export default TaskFormHeader