"use client"

import { CalendarClock, Users, Video } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { SelectSessionRequest } from "@/src/db/schema"
import {
  SessionOccurrence,
  summarizeMentorSessions
} from "./mentor-calendar/mentorCalendarUtils"

interface MentorSessionsCardProps {
  acceptedRequests: SelectSessionRequest[]
}

function SessionRow({ request, occurrence }: SessionOccurrence) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-foreground/8 last:border-b-0">
      <div className="h-9 w-9 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
        {request.session_type === "group" ? (
          <Users className="h-4 w-4 text-primary" />
        ) : (
          <Video className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{request.topic}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {request.session_type === "group" ? "Group" : "1-on-1"} ·{" "}
          {occurrence.format("ddd, MMM D · h:mm A")}
        </p>
      </div>
    </div>
  )
}

export default function MentorSessionsCard({
  acceptedRequests
}: MentorSessionsCardProps) {
  const { mode, items } = summarizeMentorSessions(acceptedRequests)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          {mode === "past" ? "Recent Sessions" : "Upcoming Sessions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "none" ? (
          <div className="flex items-center justify-center py-4">
            <p className="text-muted-foreground">No sessions so far</p>
          </div>
        ) : (
          <div>
            {items.map(({ request, occurrence }) => (
              <SessionRow
                key={request.id}
                request={request}
                occurrence={occurrence}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
