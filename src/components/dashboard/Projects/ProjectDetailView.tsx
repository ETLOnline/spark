'use client'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Progress } from "@/src/components/ui/progress"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Separator } from "@/src/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"
import { BookOpen, Calendar, FileText, Link, MessageSquare, ThumbsUp, Users } from 'lucide-react'

interface ProjectDetails {
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
  const [newComment, setNewComment] = useState("")
  const [newUpdate, setNewUpdate] = useState("")

  const handleAddComment = () => {
    if (newComment.trim() === "") return
    const comment: Comment = {
      id: `c${project.comments.length + 1}`,
      author: { name: "Current User", avatar: "/avatars/04.png" },
      content: newComment,
      createdAt: new Date().toISOString(),
    }
    setProject({ ...project, comments: [...project.comments, comment] })
    setNewComment("")
  }

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
    <div className="h-[calc(100vh-7rem)] flex">
      {/* Left Sidebar - Project Details */}
      <div className="w-1/4 border-r p-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Details</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Badge variant={project.status === "active" ? "default" : project.status === "completed" ? "secondary" : "outline"}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="text-sm">Started: {new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="text-sm">Target: {new Date(project.targetDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Progress</span>
                <Progress value={project.progress} className="mt-1" />
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Contributors</h3>
            <div className="space-y-2">
              {project.contributors.map((contributor) => (
                <div key={contributor.id} className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar} alt={contributor.name} />
                    <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground">{contributor.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Resources</h3>
            <div className="space-y-2">
              {project.resources.map((resource) => (
                <div key={resource.id} className="flex items-center">
                  {resource.type === "document" && <FileText className="mr-2 h-4 w-4" />}
                  {resource.type === "link" && <Link className="mr-2 h-4 w-4" />}
                  {resource.type === "image" && <BookOpen className="mr-2 h-4 w-4" />}
                  <a href={resource.url} className="text-sm text-blue-500 hover:underline">{resource.title}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Project Description and Updates */}
      <div className="flex-1 p-4 overflow-auto">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{project.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>Project Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.updates.map((update) => (
                    <div key={update.id} className="flex space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={update.author.avatar} alt={update.author.name} />
                        <AvatarFallback>{update.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{update.author.name}</p>
                        <p className="text-sm">{update.content}</p>
                        <p className="text-xs text-muted-foreground">{new Date(update.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <form onSubmit={(e) => { e.preventDefault(); handleAddUpdate(); }} className="w-full">
                  <Textarea
                    placeholder="Add a project update..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    className="mb-2"
                  />
                  <Button type="submit">Post Update</Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar - Comments */}
      <div className="w-1/4 border-l p-4 overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-4">
            {project.comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">{comment.author.name}</CardTitle>
                      <CardDescription className="text-xs">{new Date(comment.createdAt).toLocaleString()}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleAddComment}>Post Comment</Button>
        </div>
      </div>
    </div>
  )
}

