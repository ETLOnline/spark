'use client'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Briefcase, DollarSign, Search, Star, PenToolIcon as Tool } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  provider: {
    name: string
    avatar: string
    rating: number
  }
  price: number
  category: string
}

interface Project {
  id: string
  title: string
  description: string
  budget: string
  skills: string[]
  postedBy: {
    name: string
    avatar: string
  }
}

interface Tool {
  id: string
  name: string
  description: string
  price: string
  category: string
}

const sampleServices: Service[] = [
  {
    id: "1",
    title: "Full-Stack Web Development",
    description: "Expert web development services using modern technologies.",
    provider: { name: "Alice Johnson", avatar: "/avatars/01.png", rating: 4.8 },
    price: 75,
    category: "Development",
  },
  {
    id: "2",
    title: "UI/UX Design",
    description: "Create intuitive and visually appealing user interfaces.",
    provider: { name: "Bob Smith", avatar: "/avatars/02.png", rating: 4.9 },
    price: 60,
    category: "Design",
  },
  {
    id: "3",
    title: "Data Analysis and Visualization",
    description: "Transform your data into actionable insights.",
    provider: { name: "Charlie Davis", avatar: "/avatars/03.png", rating: 4.7 },
    price: 80,
    category: "Data Science",
  },
]

const sampleProjects: Project[] = [
  {
    id: "1",
    title: "E-commerce Platform Development",
    description: "Looking for a team to build a scalable e-commerce platform with advanced features.",
    budget: "$5000 - $10000",
    skills: ["React", "Node.js", "MongoDB", "AWS"],
    postedBy: { name: "TechCorp Inc.", avatar: "/avatars/04.png" },
  },
  {
    id: "2",
    title: "Machine Learning Model for Predictive Maintenance",
    description: "Need an expert to develop a ML model for predicting equipment failures in manufacturing.",
    budget: "$3000 - $7000",
    skills: ["Python", "TensorFlow", "Data Analysis"],
    postedBy: { name: "IndustrialAI Ltd.", avatar: "/avatars/05.png" },
  },
]

const sampleTools: Tool[] = [
  {
    id: "1",
    name: "CodeAssist Pro",
    description: "AI-powered code completion and refactoring tool.",
    price: "$9.99/month",
    category: "Development",
  },
  {
    id: "2",
    name: "DataViz Master",
    description: "Advanced data visualization and reporting software.",
    price: "$19.99/month",
    category: "Data Science",
  },
  {
    id: "3",
    name: "DesignFlow",
    description: "Collaborative design platform for teams.",
    price: "$14.99/month",
    category: "Design",
  },
]

export default function MarketplaceScreen() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="h-full flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Marketplace</CardTitle>
          <CardDescription>Find services, projects, and tools for your next venture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services, projects, and tools"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="flex-1">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sampleServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-2">
                      <Avatar>
                        <AvatarImage src={service.provider.avatar} alt={service.provider.name} />
                        <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{service.provider.name}</p>
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{service.provider.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{service.category}</Badge>
                      <span className="text-lg font-bold">${service.price}/hr</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Hire Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="projects" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4">
              {sampleProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-2">
                      <Avatar>
                        <AvatarImage src={project.postedBy.avatar} alt={project.postedBy.name} />
                        <AvatarFallback>{project.postedBy.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{project.postedBy.name}</p>
                        <p className="text-sm text-muted-foreground">Project Owner</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm font-medium">{project.budget}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Apply Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="tools" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sampleTools.map((tool) => (
                <Card key={tool.id}>
                  <CardHeader>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{tool.category}</Badge>
                      <span className="text-lg font-bold">{tool.price}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Tool className="mr-2 h-4 w-4" />
                      Try for Free
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

