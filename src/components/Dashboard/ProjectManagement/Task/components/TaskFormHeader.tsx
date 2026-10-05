"use client"
import { SelectTask } from "@/src/db/schema"
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { projectStore } from "@/src/store/project/projectStore"
import { toast } from "@/src/hooks/use-toast"
import { generateUrl } from "@/src/utils/helpers"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { ProjectManagementPages } from "../../constants/projectManagment"
import { useAtom } from "jotai"
import { Check, ChevronRight, Copy, Ticket } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"

interface Props {
  selectedTask?: SelectTask
  onClose?: () => void
}

const PROJECT_PAGES = [
  ...ProjectManagementPages,
  { key: "completed-sprints", title: "Completed Sprints" }
]

function TaskFormHeader({ selectedTask, onClose }: Props) {
  const [project, setProject] = useAtom(projectStore.currProject)
  const [copied, setCopied] = useState(false)

  const projectId = useParams().id as string
  const pathName = usePathname()

  useEffect(() => {
    const fetchProject = async () => {
      const projectData = await GetProjectByIdAction(projectId)
      if (projectData.success && projectData.data) {
        setProject(projectData.data)
      }
    }
    fetchProject()
  }, [projectId])

  const projectBasePath = `/project/${projectId}`
  const overviewPath = `${projectBasePath}/overview`
  const currentPageKey = pathName
    .replace(projectBasePath, "")
    .split("/")
    .filter(Boolean)[0]
  const currentPage = PROJECT_PAGES.find((page) => page.key === currentPageKey)
  const currentPagePath = currentPage
    ? `${projectBasePath}/${currentPage.key}`
    : ""
  const taskPath = selectedTask
    ? `${projectBasePath}/task/${selectedTask.id}`
    : ""

  // When the header is rendered inside the task modal and the crumb points to
  // the page we're already on, close the modal instead of navigating.
  const handleCrumbClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (onClose && pathName === href) {
      e.preventDefault()
      onClose()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateUrl(taskPath))
      setCopied(true)
      toast({ title: "Ticket link copied to clipboard", duration: 3000 })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy ticket link"
      })
    }
  }

  return (
    <header className="border-b px-2 sm:px-4 py-2 sm:py-3 flex items-center pr-8 sm:pr-10 min-w-0 w-full">
      <nav className="flex flex-wrap items-center gap-y-1 text-[11px] sm:text-sm min-w-0 [overflow-wrap:anywhere]">
        <Link
          href={overviewPath}
          onClick={(e) => handleCrumbClick(e, overviewPath)}
          className="text-gray-500 hover:text-gray-300"
        >
          {project?.project_name}
        </Link>

        {currentPage && currentPage.key !== "overview" ? (
          <>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <Link
              href={currentPagePath}
              onClick={(e) => handleCrumbClick(e, currentPagePath)}
              className="text-gray-500 hover:text-gray-300"
            >
              {currentPage.title}
            </Link>
          </>
        ) : null}

        {selectedTask ? (
          <>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={taskPath}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-300"
            >
              <Ticket size={16} />
              {selectedTask.task_num}
            </a>
            <TooltipProvider>
              <Tooltip>
                {/* Only open on hover, the modal auto-focuses this button on open */}
                <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    aria-label="Copy link"
                    variant="ghost"
                    className="ml-2 text-gray-500"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : null}
      </nav>
    </header>
  )
}

export default TaskFormHeader
