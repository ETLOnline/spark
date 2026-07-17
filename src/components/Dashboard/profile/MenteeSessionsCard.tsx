"use client"

import Link from "next/link"
import { CalendarClock, LayoutGrid, Video, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
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

type MentorInfo = {
  unique_id: string
  first_name: string
  last_name: string
  profile_url: string | null
}

export type MenteeSessionRequest = SelectSessionRequest & {
  mentor: MentorInfo
  space?: { id: string; space_slug: string } | null
}

interface MenteeSessionsCardProps {
  acceptedRequests: MenteeSessionRequest[]
}

function SessionRow({
  request,
  occurrence
}: SessionOccurrence & { request: MenteeSessionRequest }) {
  const spaceHref = request.space
    ? `/mentorship/${request.mentor_id}/spaces/${request.space.space_slug}`
    : null

  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-foreground/8 last:border-b-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={request.mentor.profile_url || ""} />
        <AvatarFallback>{request.mentor.first_name}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{request.topic}</p>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          {request.session_type === "group" ? (
            <Users className="h-3 w-3 shrink-0" />
          ) : (
            <Video className="h-3 w-3 shrink-0" />
          )}
          with {request.mentor.first_name} {request.mentor.last_name} ·{" "}
          {occurrence.format("ddd, MMM D · h:mm A")}
        </p>
      </div>
      {spaceHref && (
        <Link href={spaceHref} className="shrink-0">
          <Button variant="outline" size="sm">
            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
            View Space
          </Button>
        </Link>
      )}
    </div>
  )
}

export default function MenteeSessionsCard({
  acceptedRequests
}: MenteeSessionsCardProps) {
  const { mode, items } = summarizeMentorSessions(acceptedRequests)

  if (mode === "none") return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          {mode === "past" ? "Your Recent Sessions" : "Your Upcoming Sessions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {items.map(({ request, occurrence }) => (
            <SessionRow
              key={request.id}
              request={request as MenteeSessionRequest}
              occurrence={occurrence}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
