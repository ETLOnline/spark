"use client"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { ScrollArea } from "../../ui/scroll-area"
import WelcomeCard from "./ProjectWelcomeCard"
import ProjectCards from "./ProjectCards"
import ProjectIncubatorStats from "./ProjectIncubatorStats"
import ProjectTopCatagories from "./ProjectTopCatagories"
import Contribute from "./ProjectFAQ"
import { SelectProject, SelectSpace } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetProjectsAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { get } from "http"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/types/loader-types"
import { useParams, useSearchParams } from "next/navigation"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import { space } from "postcss/lib/list"
import { navStore } from "@/src/store/nav/navStore"
import CreateNewProject from "./CreateNewProject"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import NoDataCard from "../Channels/ChannelDetails/NoDataCard"
import { ListX } from "lucide-react"

interface Props {
  space: SelectSpace
}

const categories = [
  "AI & Development",
  "Blockchain & Education",
  "IoT & Sustainability",
  "Mobile Apps",
  "Web Platforms",
  "Data Science",
  "Cybersecurity",
  "AR/VR"
]

export function ProjectScreen({ space }: Props) {
  const [projects, setProjects] = useAtom(projectStore.projects)
  const [currSpace, setCurrSpace] = useState<SelectSpace>()
  const setCrumbRoutes = useSetAtom(navStore.crumbRoutes)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<SelectProject | null>(
    null
  )

  const handleEdit = (project: SelectProject) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const [getProjectLoading, getProjectData, getProjectError, getProjects] =
    useServerAction(GetProjectsAction)

  const [getSpaceLoading, getSpaceData, getSpaceError, getSpaceBySlug] =
    useServerAction(GetSpaceBySlugAction)

  const searchParam = useSearchParams()
  const spaceSlug = searchParam.get("space")
  const channel_slug = searchParam.get("channel")

  useEffect(() => {
    setCurrSpace(space)
  }, [space])

  useEffect(() => {
    if (currSpace) {
      getProjects(currSpace.id)
    }
  }, [currSpace])

  useEffect(() => {
    if (getProjectData !== null) {
      setProjects(getProjectData.data ?? [])
    }
  }, [getProjectData])

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    currSpace?.id
  )
  const canView = permissionChecker
    ? permissionChecker.canAccess("project.view")
    : false

  return (
    <div className="flex flex-col space-y-4">
      <WelcomeCard />
      {getProjectLoading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <Loader size={LoaderSizes.lg} />
        </div>
      ) : (
        <div className="flex-grow flex space-x-4">
          <div className="w-full ">
            <Tabs defaultValue="all">
              <TabsList className="w-full justify-around lg:w-auto">
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <ScrollArea>
                  {canView &&
                    (projects.length > 0 ? (
                      projects.map((project) => (
                        <ProjectCards
                          key={project.id}
                          project={project}
                          onEdit={handleEdit}
                        />
                      ))
                    ) : (
                      <NoDataCard
                        icon={<ListX className="h-16 w-16" />}
                        title="No projects found"
                        description="Create a project to get started"
                      />
                    ))}
                </ScrollArea>
              </TabsContent>
              {/* <TabsContent value="active">
                    <ScrollArea>
                      {proposals
                        .filter((p) => p.status === "active")
                        .map((proposal) => (
                          <ProjectCards key={proposal.id} proposal={proposal} />
                        ))}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="draft">
                    <ScrollArea>
                      {proposals
                        .filter((p) => p.status === "draft")
                        .map((proposal) => (
                          <ProjectCards key={proposal.id} proposal={proposal} />
                        ))}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="completed">
                    <ScrollArea>
                      {proposals
                        .filter((p) => p.status === "completed")
                        .map((proposal) => (
                          <ProjectCards key={proposal.id} proposal={proposal} />
                        ))}
                    </ScrollArea>
                  </TabsContent> */}
            </Tabs>
          </div>
          {isModalOpen && selectedProject && currSpace && (
            <CreateNewProject
              currSpace={currSpace}
              defaultValues={selectedProject}
              isEditing={true}
              isOpen={isModalOpen}
              setIsOpen={setIsModalOpen}
            />
          )}
          {/* <div className="w-1/4 hidden lg:block space-y-4">
            <ProjectIncubatorStats proposals={proposals} />
            <ProjectTopCatagories categories={categories} />
            <Contribute />
          </div> */}
        </div>
      )}
    </div>
  )
}
