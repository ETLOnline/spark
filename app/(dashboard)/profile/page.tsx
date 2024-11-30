"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, StarIcon, TrophyIcon, UserIcon } from 'lucide-react'

const skillTags = ["React", "Next.js", "TypeScript", "UI/UX", "Node.js"]
const interests = ["Web Development", "AI", "Open Source", "Tech Writing"]
const recommendations = [
  { name: "Jane Doe", text: "An exceptional developer with a keen eye for detail." },
  { name: "John Smith", text: "Always delivers high-quality work on time." },
]
const rewards = [
  { title: "Top Contributor", description: "Awarded for outstanding contributions to the team" },
  { title: "Innovation Champion", description: "Recognized for implementing creative solutions" },
]
const activities = [
  { date: "2023-04-01", description: "Completed the 'Advanced React Patterns' course" },
  { date: "2023-03-15", description: "Contributed to open-source project 'awesome-ui-components'" },
]

export default function ProfileScreen() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/avatars/01.png" alt="Profile picture" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Jane Developer</h1>
          <p className="text-muted-foreground">Senior Frontend Engineer</p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic"><UserIcon className="mr-2 h-4 w-4" />Bio/Basic</TabsTrigger>
          <TabsTrigger value="rewards"><TrophyIcon className="mr-2 h-4 w-4" />Rewards</TabsTrigger>
          <TabsTrigger value="activity"><StarIcon className="mr-2 h-4 w-4" />Activity</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" />Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Bio</CardTitle>
              <CardDescription>Your professional summary and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skillTags.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Recommendations</h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="rounded-lg border p-3">
                      <p className="text-sm">&quot;{rec.text}&quot;</p>
                      <p className="mt-1 text-xs text-muted-foreground">- {rec.name}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>Your achievements and recognitions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {rewards.map((reward, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <TrophyIcon className="mt-0.5 h-5 w-5 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Your recent activities and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activities.map((activity, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <StarIcon className="mt-0.5 h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Your schedule and upcoming events</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

