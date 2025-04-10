import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import React from 'react'



const recentActivity = [
  {
    id: "1",
    user: "Alex Johnson",
    avatar: "/avatars/01.png",
    action: "completed task",
    item: "Implement user authentication",
    time: "2 hours ago",
  },
  {
    id: "2",
    user: "Sarah Miller",
    avatar: "/avatars/02.png",
    action: "commented on",
    item: "API integration issues",
    time: "4 hours ago",
  },
  {
    id: "3",
    user: "David Chen",
    avatar: "/avatars/03.png",
    action: "uploaded file",
    item: "UI mockups.fig",
    time: "Yesterday",
  },
  {
    id: "4",
    user: "Emma Wilson",
    avatar: "/avatars/04.png",
    action: "moved task",
    item: "Database optimization",
    time: "Yesterday",
  },
  {
    id: "5",
    user: "James Taylor",
    avatar: "/avatars/05.png",
    action: "created task",
    item: "Fix navigation bug",
    time: "2 days ago",
  },
]

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from the team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback>{activity.user[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.item}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentActivity