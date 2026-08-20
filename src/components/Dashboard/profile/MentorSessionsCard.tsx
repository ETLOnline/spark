"use client"

import Link from "next/link"
import { CalendarClock } from "lucide-react"
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
import { ViewSpaceButton } from "./ViewSpaceButton"
import { SessionTypeIcon } from "./SessionTypeIcon"

export type MentorSessionRequest = SelectSessionRequest & {
  space?: { id: string; space_slug: string } | null
}

interface MentorSessionsCardProps {
  acceptedRequests: MentorSessionRequest[]
  isMyProfile?: boolean
}

function SessionRow({
  request,
  occurrence
}: {
  request: MentorSessionRequest
  occurrence: SessionOccurrence["occurrence"]
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-foreground/8 last:border-b-0">
      <SessionTypeIcon sessionType={request.session_type} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{request.topic}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {request.session_type === "group" ? "Group" : "1-on-1"} ·{" "}
          {occurrence.format("ddd, MMM D · h:mm A")}
        </p>
      </div>
      <ViewSpaceButton spaceSlug={request.space?.space_slug} />
    </div>
  )
}

export default function MentorSessionsCard({
  acceptedRequests,
  isMyProfile
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

        {/* Mentor: quick access to the full chronological list of booked sessions */}
        {isMyProfile && (
          <Link href="/profile/booked-slots" className="w-full">
            <Button variant="outline" className="w-full mt-3" size="sm">
              View Booked Slots
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
