"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Link as LinkIcon, Star } from "lucide-react"
import moment from "moment-timezone"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetFypProjectDetailAction } from "@/src/server-actions/Fyp/Fyp"
import { GetMilestonesForSpaceAction } from "@/src/server-actions/Milestone/Milestone"
import { GetMomsForSpaceAction } from "@/src/server-actions/Mom/Mom"
import { GetProgramFeedbackForSpaceAction } from "@/src/server-actions/ProgramFeedback/ProgramFeedback"
import { GetSpaceUsersAction } from "@/src/server-actions/Space/Space"
import type { FypProjectDetail } from "@/src/types/Fyp/Fyp"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import { formatTime } from "@/src/components/Dashboard/profile/mentor-calendar/mentorCalendarUtils"

interface MilestoneRow {
  id: string
  name: string
  status: MilestoneStatus
  start_date: string | null
  end_date: string | null
  artifacts: { id: number; type: string }[]
}

interface MomRow {
  id: string
  meeting_date: string
  meeting_start_time: string
  meeting_end_time: string
  participants: string[]
  discussion_summary: string
  action_items: { id: string; text: string; done: boolean }[]
}

interface FeedbackRow {
  id: number
  submitted_by: string
  overall_program_rating: number
  spark_overall_rating: number
  partner_rating: number
  answers: {
    key: string
    question: string
    type: "rating" | "single_choice" | "multi_choice" | "text"
    value: number | string | string[] | null
  }[]
}

const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  [MilestoneStatus.INCOMPLETE]: "Incomplete",
  [MilestoneStatus.IN_PROGRESS]: "In progress",
  [MilestoneStatus.COMPLETED_PENDING_VERIFICATION]: "Pending verification",
  [MilestoneStatus.VERIFIED]: "Verified"
}

const MILESTONE_STATUS_CLASS: Record<MilestoneStatus, string> = {
  [MilestoneStatus.INCOMPLETE]: "bg-muted text-muted-foreground",
  [MilestoneStatus.IN_PROGRESS]: "bg-blue-500/15 text-blue-600",
  [MilestoneStatus.COMPLETED_PENDING_VERIFICATION]:
    "bg-amber-500/15 text-amber-600",
  [MilestoneStatus.VERIFIED]: "bg-emerald-500/15 text-emerald-600"
}

function AnswerValue({ answer }: { answer: FeedbackRow["answers"][number] }) {
  if (
    answer.value === null ||
    answer.value === undefined ||
    answer.value === ""
  )
    return <span className="text-muted-foreground">—</span>
  if (answer.type === "rating")
    return (
      <span className="inline-flex items-center gap-1 font-semibold">
        {answer.value}
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      </span>
    )
  if (Array.isArray(answer.value))
    return (
      <div className="flex flex-wrap gap-1">
        {answer.value.map((v) => (
          <Badge key={v} variant="outline" className="font-normal">
            {v}
          </Badge>
        ))}
      </div>
    )
  return <span>{answer.value}</span>
}

interface FypDetailViewProps {
  spaceId: string
}

export default function FypDetailView({ spaceId }: FypDetailViewProps) {
  const [project, setProject] = useState<FypProjectDetail | null>(null)
  const [milestones, setMilestones] = useState<MilestoneRow[]>([])
  const [moms, setMoms] = useState<MomRow[]>([])
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})

  const [projectLoading, , , fetchProject] = useServerAction(
    GetFypProjectDetailAction
  )
  const [milestonesLoading, , , fetchMilestones] = useServerAction(
    GetMilestonesForSpaceAction
  )
  const [momsLoading, , , fetchMoms] = useServerAction(GetMomsForSpaceAction)
  const [feedbackLoading, , , fetchFeedback] = useServerAction(
    GetProgramFeedbackForSpaceAction
  )
  const [, , , fetchSpaceUsers] = useServerAction(GetSpaceUsersAction)

  useEffect(() => {
    fetchProject(spaceId).then((res) => {
      if (res?.success && res.data) setProject(res.data)
    })
    fetchMilestones(spaceId).then((res) => {
      if (res?.success && res.data)
        setMilestones(res.data as unknown as MilestoneRow[])
    })
    fetchMoms(spaceId).then((res) => {
      if (res?.success && res.data) setMoms(res.data)
    })
    fetchFeedback(spaceId).then((res) => {
      if (res?.success && res.data) setFeedback(res.data)
    })
    fetchSpaceUsers(spaceId).then((res) => {
      if (res?.success && res.data) {
        const map: Record<string, string> = {}
        for (const row of res.data) {
          const user = row.user
          if (user) map[row.user_id] = `${user.first_name} ${user.last_name}`
        }
        setUserNames(map)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId])

  const nameFor = (userId: string) => userNames[userId] ?? userId

  if (projectLoading && !project) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-1 py-4 sm:p-4 lg:p-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/analytics/fyp/completed"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {project?.projectName ?? "FYP"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project?.universityTitle}
          </p>
        </div>
      </div>

      {!project ? (
        <NoDataCard
          title="Project not found"
          description="This FYP may have been removed."
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Domain
                </CardDescription>
                <p className="font-semibold mt-1">{project.domain ?? "—"}</p>
              </div>
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  University supervisor
                </CardDescription>
                <p className="font-semibold mt-1">
                  {project.universitySupervisor ?? "—"}
                </p>
              </div>
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Industry advisor
                </CardDescription>
                <p className="font-semibold mt-1">
                  {project.industryAdvisor ?? "Not assigned"}
                </p>
              </div>
              <div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Team size
                </CardDescription>
                <p className="font-semibold mt-1">
                  {project.teamMembers.length} student
                  {project.teamMembers.length === 1 ? "" : "s"}
                </p>
              </div>
              {project.techStack.length > 0 && (
                <div className="col-span-2 sm:col-span-4">
                  <CardDescription className="text-xs uppercase tracking-wide">
                    Tech stack
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.techStack.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="font-normal"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {project.teamMembers.length > 0 && (
                <div className="col-span-2 sm:col-span-4">
                  <CardDescription className="text-xs uppercase tracking-wide">
                    Team
                  </CardDescription>
                  <p className="text-sm mt-1">
                    {project.teamMembers
                      .map((m) => `${m.name} (${m.registrationNumber})`)
                      .join(", ")}
                  </p>
                </div>
              )}
              {project.abstract && (
                <div className="col-span-2 sm:col-span-4">
                  <CardDescription className="text-xs uppercase tracking-wide">
                    Abstract
                  </CardDescription>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {project.abstract}
                  </p>
                </div>
              )}
              {project.proposalLink && (
                <div className="col-span-2 sm:col-span-4">
                  <Link
                    href={project.proposalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    View proposal
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader className="p-4 sm:p-5 pb-0">
              <CardTitle className="text-sm">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-3">
              {milestonesLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No milestones defined yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.start_date
                            ? moment(m.start_date).format("MMM D, YYYY")
                            : "—"}{" "}
                          –{" "}
                          {m.end_date
                            ? moment(m.end_date).format("MMM D, YYYY")
                            : "—"}
                          {m.artifacts.length > 0 &&
                            ` · ${m.artifacts.length} artifact${m.artifacts.length === 1 ? "" : "s"}`}
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded px-2.5 py-1 text-xs font-medium flex-shrink-0 ${MILESTONE_STATUS_CLASS[m.status]}`}
                      >
                        {MILESTONE_STATUS_LABEL[m.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Minutes of Meeting */}
          <Card>
            <CardHeader className="p-4 sm:p-5 pb-0">
              <CardTitle className="text-sm">Minutes of meeting</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-3">
              {momsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : moms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No meetings logged yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {moms.map((mom) => (
                    <div key={mom.id} className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">
                        {moment(mom.meeting_date).format("MMM D, YYYY")} ·{" "}
                        {formatTime(mom.meeting_start_time)} –{" "}
                        {formatTime(mom.meeting_end_time)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Participants:{" "}
                        {mom.participants.map(nameFor).join(", ") || "—"}
                      </p>
                      <p className="mt-2 text-muted-foreground">
                        {mom.discussion_summary}
                      </p>
                      {mom.action_items.length > 0 && (
                        <ul className="mt-2 list-disc pl-4 space-y-0.5">
                          {mom.action_items.map((item) => (
                            <li
                              key={item.id}
                              className={
                                item.done
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }
                            >
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Closure feedback */}
          <Card>
            <CardHeader className="p-4 sm:p-5 pb-0">
              <CardTitle className="text-sm">Closure feedback</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-3">
              {feedbackLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : feedback.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">
                  Feedback not submitted
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {feedback.map((f) => (
                    <div key={f.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b">
                        <p className="font-medium text-sm">
                          {nameFor(f.submitted_by)}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            Overall {f.overall_program_rating}
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </span>
                          <span className="inline-flex items-center gap-1">
                            SPARK {f.spark_overall_rating}
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-sm">
                        {f.answers.map((a) => (
                          <div key={a.key} className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              {a.question}
                            </p>
                            <AnswerValue answer={a} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
