'use client'
import { useState } from "react"
import ProjectCards from "./ProjectCards"
import IncubatorStats from "./IncubatorStats"
import TopCatagories from "./TopCatagories"
import Contribute from "./Contribute"
import WelcomeCard from "./WelcomeCard"

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
    description: "Develop an AI tool that can automatically review code, suggest improvements, and detect potential bugs.",
    author: { name: "Alice Johnson", avatar: "/avatars/01.png" },
    category: "AI & Development",
    status: "active",
    likes: 42,
    comments: 15,
    contributors: 3,
  },
  {
    id: "2",
    title: "Decentralized Learning Platform",
    description: "Create a blockchain-based platform for sharing educational content and certifications.",
    author: { name: "Bob Smith", avatar: "/avatars/02.png" },
    category: "Blockchain & Education",
    status: "draft",
    likes: 28,
    comments: 7,
    contributors: 1,
  },
  {
    id: "3",
    title: "IoT Home Energy Optimization",
    description: "Build a system that uses IoT devices to monitor and optimize home energy consumption.",
    author: { name: "Charlie Davis", avatar: "/avatars/03.png" },
    category: "IoT & Sustainability",
    status: "active",
    likes: 35,
    comments: 12,
    contributors: 5,
  },
]

const categories = [
  "AI & Development",
  "Blockchain & Education",
  "IoT & Sustainability",
  "Mobile Apps",
  "Web Platforms",
  "Data Science",
  "Cybersecurity",
  "AR/VR",
]

export function ProjectIncubatorScreen() {
  const [proposals, setProposals] = useState<ProjectProposal[]>(sampleProposals)
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    category: "",
  })
  const [detailedViewOpen, setDetailedViewOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleCreateProposal = () => {
    if (newProposal.title && newProposal.description && newProposal.category) {
      const createdProposal: ProjectProposal = {
        id: (proposals.length + 1).toString(),
        ...newProposal,
        author: { name: "Current User", avatar: "/avatars/04.png" },
        status: "draft",
        likes: 0,
        comments: 0,
        contributors: 1,
      }
      setProposals([createdProposal, ...proposals])
      setNewProposal({ title: "", description: "", category: "" })
    }
  }


  return (
    <div className="flex flex-col space-y-4">
      <WelcomeCard newProposal={newProposal} setNewProposal={setNewProposal} categories={categories} handleCreateProposal={handleCreateProposal} />

      <div className="flex-grow flex space-x-4">
        <div className="w-full lg:w-3/4">
          <ProjectCards proposals={proposals} />
        </div>

        <div className="w-1/4 hidden lg:block space-y-4">
          <IncubatorStats proposals={proposals} />

          <TopCatagories categories={categories} />

          <Contribute />
        </div>
      </div>
    </div>
  );
}

