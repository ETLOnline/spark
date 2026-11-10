"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
import moment from "moment-timezone"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Skeleton } from "@/src/components/ui/skeleton"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSessionDetailsAction } from "@/src/server-actions/Mentor/MentorActions"
import type { SessionDetail } from "@/src/types/Mentorship/Mentorship"
import {
  formatDuration,
  formatTime
} from "@/src/components/Dashboard/profile/mentor-calendar/mentorCalendarUtils"

const STATUS_BADGE_CLASS = {
  completed: "bg-emerald-500/15 text-emerald-600",
  pending: "bg-blue-500/15 text-blue-600",
  rejected: "bg-orange-400/15 text-orange-600"
} as const

const STATUS_LABEL = {
  completed: "Completed",
  pending: "Pending",
  rejected: "Rejected"
} as const

function FeedbackCard({
  title,
  entry
}: {
  title: string
  entry: { rating: number; comment: string | null } | null
}) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-5 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        {entry && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold">
            {entry.rating}
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-3">
        {entry ? (
          <p className="text-sm text-muted-foreground">
            {entry.comment || "No comment left."}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Feedback not submitted
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface SessionDetailViewProps {
  sessionId: number
}

export default function SessionDetailView({
  sessionId
}: SessionDetailViewProps) {
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, , , fetchSession] = useServerAction(GetSessionDetailsAction)

  useEffect(() => {
    fetchSession(sessionId).then((res) => {
      if (res?.success && res.data) setSession(res.data)
    })
  }, [sessionId])

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-1 py-4 sm:p-4 lg:p-6 w-full min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/analytics/mentorship/sessions"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 flex-wrap">
                {session?.topic ?? "Session"}
                {session && (
                  <span
                    className={`inline-block rounded px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[session.status]}`}
                  >
                    {STATUS_LABEL[session.status]}
                  </span>
                )}
              </h1>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !session ? (
        <NoDataCard
          title="Session not found"
          description="This session may have been removed."
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Session date
                </CardDescription>
                <p className="font-semibold mt-1">
                  {moment(session.date).format("MMM D, YYYY")}
                </p>
              </div>
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Time
                </CardDescription>
                <p className="font-semibold mt-1">
                  {formatTime(session.startTime)} –{" "}
                  {formatTime(session.endTime)}
                </p>
              </div>
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Duration
                </CardDescription>
                <p className="font-semibold mt-1">
                  {formatDuration(session.durationMinutes)}
                </p>
              </div>
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Format
                </CardDescription>
                <p className="font-semibold mt-1 capitalize">
                  {session.sessionType === "group" ? "Group" : "1:1"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="p-4 sm:p-5 pb-0">
                <CardDescription className="text-xs uppercase tracking-wide">
                  Mentor
                </CardDescription>
                <CardTitle className="text-base">
                  {session.mentor.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-3 text-sm space-y-1.5">
                <p className="text-muted-foreground">{session.mentor.email}</p>
                {session.mentorProfessionalTitle && (
                  <p>
                    <span className="text-muted-foreground">Title: </span>
                    {session.mentorProfessionalTitle}
                    {session.mentorCompany && ` at ${session.mentorCompany}`}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">
                    Sessions completed:{" "}
                  </span>
                  {session.mentorSessionsCompleted.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-5 pb-0">
                <CardDescription className="text-xs uppercase tracking-wide">
                  Mentee
                </CardDescription>
                <CardTitle className="text-base">
                  {session.mentee.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-3 text-sm">
                <p className="text-muted-foreground">{session.mentee.email}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-2">Feedback</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FeedbackCard
                title="Mentor → Mentee"
                entry={session.feedback.mentorToMentee}
              />
              <FeedbackCard
                title="Mentee → Mentor"
                entry={session.feedback.menteeToMentor}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
