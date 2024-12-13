'use client'

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { BookOpen, Calendar, Clock, FileText, PlayCircle, Search, Star } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  instructor: {
    name: string
    avatar: string
  }
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
  rating: number
}

interface Resource {
  id: string
  title: string
  type: "E-book" | "Whitepaper" | "Tutorial"
  author: string
}

interface Webinar {
  id: string
  title: string
  date: string
  time: string
  speaker: string
}

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    description: "Learn the basics of machine learning algorithms and their applications.",
    instructor: { name: "Dr. Alice Johnson", avatar: "/avatars/01.png" },
    duration: "6 weeks",
    level: "Beginner",
    rating: 4.7,
  },
  {
    id: "2",
    title: "Advanced Web Development with React",
    description: "Master React and build complex web applications.",
    instructor: { name: "Bob Smith", avatar: "/avatars/02.png" },
    duration: "8 weeks",
    level: "Intermediate",
    rating: 4.9,
  },
  {
    id: "3",
    title: "Data Science for Business",
    description: "Apply data science techniques to solve real-world business problems.",
    instructor: { name: "Charlie Davis", avatar: "/avatars/03.png" },
    duration: "10 weeks",
    level: "Advanced",
    rating: 4.8,
  },
]

const sampleResources: Resource[] = [
  { id: "1", title: "The Future of AI in Healthcare", type: "E-book", author: "Dr. Emily White" },
  { id: "2", title: "Blockchain Technology: A Comprehensive Guide", type: "Whitepaper", author: "Tech Innovations Inc." },
  { id: "3", title: "Building RESTful APIs with Node.js", type: "Tutorial", author: "Sarah Brown" },
]

const sampleWebinars: Webinar[] = [
  { id: "1", title: "Cybersecurity Best Practices for Remote Work", date: "2023-05-15", time: "14:00", speaker: "John Doe" },
  { id: "2", title: "The Impact of 5G on IoT", date: "2023-05-20", time: "11:00", speaker: "Jane Smith" },
  { id: "3", title: "Ethical Considerations in AI Development", date: "2023-05-25", time: "16:00", speaker: "Dr. Michael Johnson" },
]

export function LearningHubScreen() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="h-full flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Learning Hub</CardTitle>
          <CardDescription>Explore courses, resources, and webinars to enhance your skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, resources, and webinars"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="courses" className="flex-1">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sampleCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-2">
                      <Avatar>
                        <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                        <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{course.instructor.name}</p>
                        <p className="text-sm text-muted-foreground">Instructor</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{course.level}</Badge>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-400" />
                        <span className="text-sm">{course.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Enroll Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="resources" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4">
              {sampleResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.type} by {resource.author}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full">
                      {resource.type === "E-book" && <BookOpen className="mr-2 h-4 w-4" />}
                      {resource.type === "Whitepaper" && <FileText className="mr-2 h-4 w-4" />}
                      {resource.type === "Tutorial" && <PlayCircle className="mr-2 h-4 w-4" />}
                      Access Resource
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="webinars" className="flex-1">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="grid gap-4">
              {sampleWebinars.map((webinar) => (
                <Card key={webinar.id}>
                  <CardHeader>
                    <CardTitle>{webinar.title}</CardTitle>
                    <CardDescription>Speaker: {webinar.speaker}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span className="text-sm">{webinar.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm">{webinar.time}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Register</Button>
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

