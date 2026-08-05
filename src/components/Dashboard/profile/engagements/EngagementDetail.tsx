"use client"

import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ExternalLink,
  Info,
  LayoutDashboard,
  Loader2,
  Star,
  Video,
  Users
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import { cn } from "@/src/lib/utils"
import moment from "moment"
import Link from "next/link"
import { Engagement, FeedbackItem } from "./types"
import { StatusPill } from "./StatusPill"
import { FeedbackCard } from "./FeedbackCard"

function Field({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

interface EngagementDetailProps {
  engagement: Engagement
  onComplete: () => void
  onFeedback: () => void
  onArchive: () => void
  isArchiving?: boolean
  feedbackItems?: FeedbackItem[]
  feedbackLoading?: boolean
}

export function EngagementDetail({
  engagement: e,
  onComplete,
  onFeedback,
  onArchive,
  isArchiving = false,
  feedbackItems = [],
  feedbackLoading = false
}: EngagementDetailProps) {
  const sessionLabel = `${moment(e.sessionDate).format("ddd MMM D")}, ${moment(e.startTime, "HH:mm").format("h:mm A")} - ${moment(e.endTime, "HH:mm").format("h:mm A")}`
  const isCompleted = e.status === "completed"
  const isOverdue = e.status === "overdue"
  const hasSpace = !!(e.spaceId && e.spaceSlug && e.spaceCreatedBy)

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Overdue alert — step 1: not yet confirmed */}
      {isOverdue && !e.isViewerConfirmed && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 text-red-600 px-3 py-2.5 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          Session passed on {moment(e.sessionDate).format("MMM D")}. Please
          confirm your attendance and submit your feedback.
        </div>
      )}

      {/* Overdue alert — step 2: confirmed, feedback still pending */}
      {isOverdue && e.isViewerConfirmed && !e.feedbackSubmittedByViewer && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 text-amber-600 px-3 py-2.5 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          Attendance confirmed. Please submit your feedback to complete this
          session.
        </div>
      )}

      {/* Counterpart header */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
            isCompleted
              ? "bg-emerald-500/15 text-emerald-600"
              : isOverdue
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700",
            e.sessionType !== "group" || !e.isMentor
              ? "text-sm font-semibold"
              : ""
          )}
        >
          {e.sessionType === "group" && e.isMentor ? (
            <Users className="h-5 w-5" />
          ) : (
            e.counterpart.initials
          )}
        </div>

        {/* Name + subtitle */}
        <div className="flex-1 min-w-0">
          {e.sessionType === "group" && e.isMentor ? (
            <>
              <p className="text-sm font-semibold">Group Session</p>
              <p className="text-xs text-muted-foreground truncate">
                Group
                {e.attendeeCount !== undefined && (
                  <span className="ml-1">
                    · {e.attendeeCount} participant
                    {e.attendeeCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </>
          ) : e.sessionType === "group" && !e.isMentor ? (
            <>
              <p className="text-sm font-semibold">{e.counterpart.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                Mentor · Group
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">{e.counterpart.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {e.counterpart.role} · 1:1
              </p>
            </>
          )}
        </div>

        <StatusPill status={e.status} size="md" />
      </div>

      {/* Fields */}
      {isCompleted ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Topic">{e.topic}</Field>
          <Field label="Session date">{sessionLabel}</Field>
          {e.attendeeCount !== undefined && (
            <Field label="Participants">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {e.attendeeCount} mentee{e.attendeeCount !== 1 ? "s" : ""}
              </span>
            </Field>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Topic">{e.topic}</Field>
            <Field label="Session type">
              <span className="flex items-center gap-1">
                {e.sessionType === "group" ? (
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Video className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {e.sessionType === "1:1" ? "1:1" : "Group"}
              </span>
            </Field>
            <Field label="Session date">{sessionLabel}</Field>
            <Field label="Platform">Zoom</Field>
          </div>

          {e.description && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {e.description}
              </p>
            </div>
          )}

          {hasSpace && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Space</span>
              <Link
                href={`/mentorship/spaces/${encodeURIComponent(e.spaceSlug!)}`}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {e.spaceName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {e.isSpaceArchived ? "Archived" : "Active"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary shrink-0">
                  Go to Space
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Completed banner */}
      {isCompleted && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-medium text-emerald-600">
            Thank you! Your feedback has been submitted.
          </span>
        </div>
      )}

      {/* Mentor archive info banner — shown only when space is not yet archived */}
      {isCompleted && e.isMentor && hasSpace && !e.isSpaceArchived && (
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-3 py-2.5">
          <Info className="h-4 w-4  text-amber-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold  text-amber-600">
              Session completed successfully.
            </span>
            <span className="text-xs  text-amber-600">
              You can now archive this session's space. Once archived, mentees
              will no longer be able to access this space for this session.
            </span>
          </div>
        </div>
      )}

      {/* Feedback section — completed only */}
      {isCompleted && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Session Feedback
          </span>
          {feedbackLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : feedbackItems.length > 0 ? (
            <div className="flex flex-col gap-2">
              {feedbackItems.map((item) => (
                <FeedbackCard key={item.id} item={item} isMentor={e.isMentor} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              No feedback available yet.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Completed */}
        {isCompleted && (
          <>
            <Button variant="outline" disabled className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
              Feedback submitted
            </Button>

            {/* Archive — mentor only, after their own completion */}
            {e.isMentor &&
              hasSpace &&
              (e.isSpaceArchived ? (
                <Link
                  href={`/mentorship/spaces/${encodeURIComponent(e.spaceSlug!)}?session=${e.id}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    <Archive className="h-4 w-4 mr-2" />
                    View archived space
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    href={`/mentorship/spaces/${encodeURIComponent(e.spaceSlug!)}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Go to Space
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={onArchive}
                    disabled={isArchiving}
                    className="w-full"
                  >
                    {isArchiving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Archive className="h-4 w-4 mr-2" />
                    )}
                    {isArchiving ? "Archiving…" : "Archive Space"}
                  </Button>
                </>
              ))}

            {/* Mentee: Go to space button (always visible, space may be archived for this session) */}
            {!e.isMentor && hasSpace && (
              <Link
                href={`/mentorship/spaces/${encodeURIComponent(e.spaceSlug!)}?session=${e.id}`}
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {e.isSpaceArchived ? "View archived space" : "Go to space"}
                </Button>
              </Link>
            )}
          </>
        )}

        {/* Overdue: step 1 — not yet confirmed */}
        {isOverdue && !e.isViewerConfirmed && (
          <Button onClick={onComplete} className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete Session
          </Button>
        )}

        {/* Overdue: step 2 — confirmed, feedback not yet submitted */}
        {isOverdue && e.isViewerConfirmed && !e.feedbackSubmittedByViewer && (
          <Button onClick={onFeedback} className="w-full">
            <Star className="h-4 w-4 mr-2" />
            Give Feedback
          </Button>
        )}
      </div>
    </div>
  )
}
