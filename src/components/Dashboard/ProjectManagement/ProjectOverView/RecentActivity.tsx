import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { SelectProjectRecentActivity } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { getProjectRecentActivitiesAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import moment from "moment"
import Link from "next/link"
import React, { useEffect, useState } from "react"

const recentActivity = [
  {
    id: "1",
    user: "Alex Johnson",
    avatar: "/avatars/01.png",
    action: "completed task",
    item: "Implement user authentication",
    time: "2 hours ago"
  },
  {
    id: "2",
    user: "Sarah Miller",
    avatar: "/avatars/02.png",
    action: "commented on",
    item: "API integration issues",
    time: "4 hours ago"
  },
  {
    id: "3",
    user: "David Chen",
    avatar: "/avatars/03.png",
    action: "uploaded file",
    item: "UI mockups.fig",
    time: "Yesterday"
  },
  {
    id: "4",
    user: "Emma Wilson",
    avatar: "/avatars/04.png",
    action: "moved task",
    item: "Database optimization",
    time: "Yesterday"
  },
  {
    id: "5",
    user: "James Taylor",
    avatar: "/avatars/05.png",
    action: "created task",
    item: "Fix navigation bug",
    time: "2 days ago"
  }
]

interface RecentActivityProps {
  projectId: string
}

function RecentActivity({ projectId }: RecentActivityProps) {
  const [recentActivity, setRecentActivity] = useState<
    SelectProjectRecentActivity[]
  >([])

  const [recentActivityLoading, , , GetRecentActivities] = useServerAction(
    getProjectRecentActivitiesAction
  )

  const GetActivities = async () => {
    try {
      const res = await GetRecentActivities(projectId)
      if (res?.success && res.data) {
        setRecentActivity(res.data)
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error)
    }
  }

  useEffect(() => {
    if (!projectId) return
    GetActivities()
  }, [projectId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from the team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {recentActivity.map((activity) => (
            <Link
              href={activity.deep_link}
              key={activity.id}
              className="group hover:bg-muted hover:rounded-md p-2 rounded-md"
            >
              <div key={activity.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 group-hover:ring-1 ">
                  <AvatarImage src={activity.icon || "/avatars/01.png"} />
                  <AvatarFallback>{activity.activity.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm">{activity.activity}</p>
                  <p className="text-xs text-muted-foreground">
                    {moment(activity.created_at).fromNow()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentActivity
