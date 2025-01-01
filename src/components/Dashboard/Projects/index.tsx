'use client'
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { ScrollArea } from "../../ui/scroll-area"
import WelcomeCard from "./ProjectWelcomeCard"
import ProjectCards from "./ProjectCards"
import ProjectIncubatorStats from "./ProjectIncubatorStats"
import ProjectTopCatagories from "./ProjectTopCatagories"
import Contribute from "./ProjectFAQ"


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
          <Tabs defaultValue="all">
            <TabsList className="w-full justify-around lg:w-auto">
              <TabsTrigger value="all">All Proposals</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ScrollArea>
                {proposals.map((proposal) => (
                  <ProjectCards key={proposal.id} proposal={proposal} />
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="active">
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
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-1/4 hidden lg:block space-y-4">
          <ProjectIncubatorStats proposals={proposals} />

          <ProjectTopCatagories categories={categories} />

          <Contribute />
        </div>
      </div>
    </div>
  );
}

