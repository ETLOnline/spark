'use client'
import { useState } from "react"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Separator } from "@/src/components/ui/separator"
import ProjectDescriptionDetail from "./ProjectDescriptionDetail"
import ProjectStatusAndTimeline from "./ProjectStatusAndTimeline"
import ProjectContributers from "./ProjectContributers"
import ProjectResources from "./ProjectResources"
import ProjectComments from "./ProjectComments"



export interface ProjectDetails {
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
  comments: Comment[]
  contributors: Contributor[]
  progress: number
  startDate: string
  targetDate: string
  resources: Resource[]
  updates: Update[]
}

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  createdAt: string
}

interface Contributor {
  id: string
  name: string
  avatar: string
  role: string
}

interface Resource {
  id: string
  title: string
  type: "document" | "link" | "image"
  url: string
}

interface Update {
  id: string
  content: string
  createdAt: string
  author: {
    name: string
    avatar: string
  }
}

const sampleProject: ProjectDetails = {
  id: "1",
  title: "AI-Powered Code Review Assistant",
  description: "Develop an AI tool that can automatically review code, suggest improvements, and detect potential bugs. This project aims to enhance code quality and developer productivity by leveraging machine learning algorithms to analyze code patterns, identify common issues, and provide actionable feedback.",
  author: { name: "Alice Johnson", avatar: "/avatars/01.png" },
  category: "AI & Development",
  status: "active",
  likes: 42,
  comments: [
    { id: "c1", author: { name: "Bob Smith", avatar: "/avatars/02.png" }, content: "This is a great idea! Have you considered integrating with popular IDEs?", createdAt: "2023-04-15T10:30:00Z" },
    { id: "c2", author: { name: "Charlie Davis", avatar: "/avatars/03.png" }, content: "I'd love to contribute to this project. What programming languages are you planning to support initially?", createdAt: "2023-04-15T11:45:00Z" },
  ],
  contributors: [
    { id: "u1", name: "Alice Johnson", avatar: "/avatars/01.png", role: "Project Lead" },
    { id: "u2", name: "Bob Smith", avatar: "/avatars/02.png", role: "AI Engineer" },
    { id: "u3", name: "Charlie Davis", avatar: "/avatars/03.png", role: "Full Stack Developer" },
  ],
  progress: 35,
  startDate: "2023-03-01",
  targetDate: "2023-09-30",
  resources: [
    { id: "r1", title: "Project Proposal", type: "document", url: "#" },
    { id: "r2", title: "AI Model Architecture", type: "image", url: "#" },
    { id: "r3", title: "Development Roadmap", type: "link", url: "#" },
  ],
  updates: [
    { id: "u1", content: "Completed initial research on existing code review tools and AI models.", createdAt: "2023-03-15T09:00:00Z", author: { name: "Alice Johnson", avatar: "/avatars/01.png" } },
    { id: "u2", content: "Started development of the core AI model for code analysis.", createdAt: "2023-04-01T14:30:00Z", author: { name: "Bob Smith", avatar: "/avatars/02.png" } },
  ],
}

export function ProjectDetailView() {
  const [project, setProject] = useState<ProjectDetails>(sampleProject)
  const [newUpdate, setNewUpdate] = useState("")

  const handleAddUpdate = () => {
    if (newUpdate.trim() === "") return
    const update: Update = {
      id: `u${project.updates.length + 1}`,
      content: newUpdate,
      createdAt: new Date().toISOString(),
      author: { name: "Current User", avatar: "/avatars/04.png" },
    }
    setProject({ ...project, updates: [...project.updates, update] })
    setNewUpdate("")
  }

  return (
    <div className=" flex flex-wrap  w-full">
      {/* Left Sidebar - Project Details */}
      <ScrollArea className="w-full sm:w-1/3 lg:w-1/4  sm:border-r p-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
        <div className="space-y-4">
          <ProjectStatusAndTimeline project={project} />
          <Separator />
          <ProjectContributers contributors={project.contributors} />
          <Separator />
          <ProjectResources resources={project.resources} />
        </div>
      </ScrollArea>

      {/* Main Content - Project Description and Updates */}
      <div className="w-full sm:w-2/3 lg:w-2/4  p-4 overflow-auto">
        <ProjectDescriptionDetail project={project} handleAddUpdate={handleAddUpdate} newUpdate={newUpdate} setNewUpdate={setNewUpdate} />
      </div>

      {/* Right Sidebar - Comments */}
      <ScrollArea className="w-full lg:w-1/4 lg:border-l p-4 overflow-auto">
        <ProjectComments project={project} updateProject={setProject} />
      </ScrollArea>
    </div>
  )
}

