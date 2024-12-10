'use client'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Separator } from "@/src/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"
import { BookOpen, MessageSquare, ThumbsUp, Users, Zap } from 'lucide-react'
import { LinkAsButton } from "../../LinkAsButton/LinkAsButton"

interface ProjectProposal {
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
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Incubator</CardTitle>
          <CardDescription>Submit, refine, and collaborate on innovative project ideas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight">Welcome to the Incubator</h3>
              <p className="text-sm text-muted-foreground">
                Here, ideas become reality. Submit your project proposal or contribute to existing ones.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Submit New Proposal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Project Proposal</DialogTitle>
                  <DialogDescription>
                    Share your innovative idea with the community. Be clear and concise.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <select
                      id="category"
                      value={newProposal.category}
                      onChange={(e) => setNewProposal({ ...newProposal, category: e.target.value })}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newProposal.description}
                      onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                      className="col-span-3"
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateProposal}>Submit Proposal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="flex-grow flex space-x-4">
        <div className="w-3/4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Proposals</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {proposals.map((proposal) => (
                  <Card key={proposal.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{proposal.title}</CardTitle>
                          <CardDescription>{proposal.category}</CardDescription>
                        </div>
                        <Badge variant={proposal.status === "active" ? "default" : proposal.status === "completed" ? "secondary" : "outline"}>
                          {proposal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {proposal.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          {proposal.comments}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {proposal.contributors}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={proposal.author.avatar} alt={proposal.author.name} />
                          <AvatarFallback>{proposal.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{proposal.author.name}</span>
                      </div>
                      <LinkAsButton href="/project-incubator/detail" >View Details</LinkAsButton>
                    </CardFooter>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="active">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {proposals.filter(p => p.status === "active").map((proposal) => (
                  <Card key={proposal.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{proposal.title}</CardTitle>
                          <CardDescription>{proposal.category}</CardDescription>
                        </div>
                        <Badge variant={proposal.status === "active" ? "default" : proposal.status === "completed" ? "secondary" : "outline"}>
                          {proposal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {proposal.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          {proposal.comments}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {proposal.contributors}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={proposal.author.avatar} alt={proposal.author.name} />
                          <AvatarFallback>{proposal.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{proposal.author.name}</span>
                      </div>
                      <LinkAsButton href="/project-incubator/detail" >View Details</LinkAsButton>
                    </CardFooter>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="draft">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {proposals.filter(p => p.status === "draft").map((proposal) => (
                  <Card key={proposal.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{proposal.title}</CardTitle>
                          <CardDescription>{proposal.category}</CardDescription>
                        </div>
                        <Badge variant={proposal.status === "active" ? "default" : proposal.status === "completed" ? "secondary" : "outline"}>
                          {proposal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {proposal.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          {proposal.comments}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {proposal.contributors}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={proposal.author.avatar} alt={proposal.author.name} />
                          <AvatarFallback>{proposal.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{proposal.author.name}</span>
                      </div>
                      <LinkAsButton href="/project-incubator/detail" >View Details</LinkAsButton>
                    </CardFooter>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="completed">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {proposals.filter(p => p.status === "completed").map((proposal) => (
                  <Card key={proposal.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{proposal.title}</CardTitle>
                          <CardDescription>{proposal.category}</CardDescription>
                        </div>
                        <Badge variant={proposal.status === "active" ? "default" : proposal.status === "completed" ? "secondary" : "outline"}>
                          {proposal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {proposal.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          {proposal.comments}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {proposal.contributors}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={proposal.author.avatar} alt={proposal.author.name} />
                          <AvatarFallback>{proposal.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{proposal.author.name}</span>
                      </div>
                      <LinkAsButton href="/project-incubator/detail" >View Details</LinkAsButton>
                    </CardFooter>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-1/4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incubator Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-primary" />
                    Active Projects
                  </span>
                  <span className="font-bold">{proposals.filter(p => p.status === "active").length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    Total Contributors
                  </span>
                  <span className="font-bold">{proposals.reduce((acc, p) => acc + p.contributors, 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-primary" />
                    Completed Projects
                  </span>
                  <span className="font-bold">{proposals.filter(p => p.status === "completed").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {categories.slice(0, 5).map((category, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{category}</span>
                    <Badge variant="secondary">{Math.floor(Math.random() * 20) + 1}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Contribute</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Browse active projects</li>
                <li>Offer feedback and suggestions</li>
                <li>Join a project team</li>
                <li>Submit your own proposal</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

