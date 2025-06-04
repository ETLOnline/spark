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

export interface ProjectProposal {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar: string
  }
  category: string
  status: "draft" | "active" | "completed"
  likes: number
  comments: number
  contributors: number
}

const sampleProposals: ProjectProposal[] = [
  {
    id: "1",
    title: "AI-Powered Code Review Assistant",
    description:
      "Develop an AI tool that can automatically review code, suggest improvements, and detect potential bugs.",
    author: { name: "Alice Johnson", avatar: "/avatars/01.png" },
    category: "AI & Development",
    status: "active",
    likes: 42,
    comments: 15,
    contributors: 3
  },
  {
    id: "2",
    title: "Decentralized Learning Platform",
    description:
      "Create a blockchain-based platform for sharing educational content and certifications.",
    author: { name: "Bob Smith", avatar: "/avatars/02.png" },
    category: "Blockchain & Education",
    status: "draft",
    likes: 28,
    comments: 7,
    contributors: 1
  },
  {
    id: "3",
    title: "IoT Home Energy Optimization",
    description:
      "Build a system that uses IoT devices to monitor and optimize home energy consumption.",
    author: { name: "Charlie Davis", avatar: "/avatars/03.png" },
    category: "IoT & Sustainability",
    status: "active",
    likes: 35,
    comments: 12,
    contributors: 5
  }
]

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

export function ProjectScreen() {
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
    const getSpace = async () => {
      if (spaceSlug && channel_slug) {
        const space = await getSpaceBySlug(spaceSlug, channel_slug)
        if (space?.success && space.data) {
          setCurrSpace(space.data)
        }
      }
    }
    getSpace()
  }, [spaceSlug, channel_slug])

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

  useEffect(() => {
    setCrumbRoutes((prev) =>
      prev.map((r) =>
        r.id === "project" && typeof r.url === "function"
          ? {
              ...r,
              url: r.url(channel_slug ?? "", spaceSlug ?? "")
            }
          : r
      )
    )
  }, [channel_slug, spaceSlug])

  return (
    <div className="flex flex-col space-y-4">
      <WelcomeCard />
      {getProjectLoading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <Loader size={LoaderSizes.lg} />
        </div>
      ) : (
        <div className="flex-grow flex space-x-4">
          <div className="w-full lg:w-3/4">
            <Tabs defaultValue="all">
              <TabsList className="w-full justify-around lg:w-auto">
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <ScrollArea>
                  {projects.map((project) => (
                    <ProjectCards
                      key={project.id}
                      project={project}
                      onEdit={handleEdit}
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
          {isModalOpen && selectedProject && (
            <CreateNewProject
              defaultValues={selectedProject}
              isEditing={true}
              isOpen={isModalOpen}
              setIsOpen={setIsModalOpen}
            />
          )}
          <div className="w-1/4 hidden lg:block space-y-4">
            {/* <ProjectIncubatorStats proposals={proposals} /> */}
            <ProjectTopCatagories categories={categories} />
            <Contribute />
          </div>
        </div>
      )}
    </div>
  )
}
