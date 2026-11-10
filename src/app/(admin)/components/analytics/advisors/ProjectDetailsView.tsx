"use client"

import { ReactNode } from "react"
import { format } from "date-fns"
import { FileText, Image as ImageIcon, Link2, Star } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { MilestoneStatusBadge } from "@/src/app/(dashboard)/channels/[channel_slug]/spaces/[space_slug]/(space-layout)/components/MilestoneStatusBadge"
import { SnapshotUnavailable } from "../AnalyticsPage"
import { DrillDownHeader } from "./DrillDownHeader"
import { DRILLDOWN_LINK_CLASS, DRILLDOWN_PAGE_CLASS } from "./constants"
import {
  AdminClosureRating,
  AdminFypProjectDetails,
  AdminProjectMilestone
} from "@/src/types/Advisors/AdminAdvisors"

// TODO(phase 3): load with GetAdminFypProjectDetailsAction(spaceId).
const loadProjectDetails = (spaceId: string): AdminFypProjectDetails | null => {
  void spaceId
  return null
}

const formatDate = (iso: string | null) =>
  iso ? format(new Date(iso), "MMM d, yyyy") : null

const FILE_ICONS = { file: FileText, image: ImageIcon, link: Link2 } as const

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

function NotSubmitted() {
  return (
    <p className="text-sm italic text-muted-foreground">
      Feedback not submitted
    </p>
  )
}

function Rating({ value }: { value: number }) {
  return (
    <span
      className="flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap"
      aria-label={`Rated ${value} out of 5`}
    >
      <span className="flex" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < value ? "fill-current" : "opacity-30"}`}
          />
        ))}
      </span>
      {value}/5
    </span>
  )
}

function RatingRow({
  name,
  feedback
}: {
  name: string
  feedback: AdminClosureRating | null
}) {
  if (!feedback) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed px-3 py-2.5">
        <span className="text-sm font-medium">{name}</span>
        <NotSubmitted />
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          Submitted via FYP Program Feedback ·{" "}
          {formatDate(feedback.submittedAt)}
        </p>
      </div>
      <Rating value={feedback.rating} />
    </div>
  )
}

function MilestoneColumn({ milestone }: { milestone: AdminProjectMilestone }) {
  const start = formatDate(milestone.startDate)
  const end = formatDate(milestone.endDate)
  return (
    <div className="min-w-0 border-t-[3px] border-teal-500 pt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{milestone.name}</span>
        <MilestoneStatusBadge status={milestone.status} />
      </div>
      {(start || end) && (
        <span className="text-xs text-muted-foreground">
          {start ?? "—"} – {end ?? "—"}
        </span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {milestone.files.length === 0 ? (
          <span className="text-xs text-muted-foreground">No files</span>
        ) : (
          milestone.files.map((f) => {
            const Icon = FILE_ICONS[f.type]
            return (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-xs hover:border-teal-500 transition-colors"
              >
                <Icon aria-hidden="true" className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{f.name}</span>
              </a>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function ProjectDetailsView({ spaceId }: { spaceId: string }) {
  const project = loadProjectDetails(spaceId)

  if (!project) {
    return (
      <div className={DRILLDOWN_PAGE_CLASS}>
        <DrillDownHeader title="Project details" />
        <SnapshotUnavailable />
      </div>
    )
  }

  const path = [
    project.communityName,
    project.channelName,
    project.spaceName
  ].join(" / ")
  const completed = formatDate(project.completedAt)

  return (
    <div className={DRILLDOWN_PAGE_CLASS}>
      <DrillDownHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {project.title}
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            >
              Completed
            </Badge>
          </span>
        }
        description={[
          project.domain ? `Domain: ${project.domain}` : null,
          path,
          completed ? `Completed ${completed}` : null
        ]
          .filter(Boolean)
          .join(" · ")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
        <Card className="p-4 sm:p-5 flex flex-col gap-3">
          <SectionLabel>Advisor</SectionLabel>
          {project.advisor ? (
            <>
              {project.advisor.linkedinUrl ? (
                <a
                  href={project.advisor.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-base ${DRILLDOWN_LINK_CLASS}`}
                >
                  {project.advisor.name}
                </a>
              ) : (
                <p className="text-base font-semibold">
                  {project.advisor.name}
                </p>
              )}
              <dl className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="[overflow-wrap:anywhere]">
                  {project.advisor.email}
                </dd>
                <dt className="text-muted-foreground">LinkedIn</dt>
                <dd className="[overflow-wrap:anywhere]">
                  {project.advisor.linkedinUrl ? (
                    project.advisor.linkedinUrl.replace(
                      /^https?:\/\/(www\.)?/,
                      ""
                    )
                  ) : (
                    <span className="text-muted-foreground">Not added</span>
                  )}
                </dd>
                <dt className="text-muted-foreground">Domain</dt>
                <dd>{project.advisor.domains.join(", ") || "—"}</dd>
              </dl>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No advisor assigned</p>
          )}
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col gap-3">
          <SectionLabel>Student group</SectionLabel>
          {project.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students listed</p>
          ) : (
            <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 text-sm">
              {project.students.map((s) => (
                <div key={s.registrationNumber + s.name} className="contents">
                  <dt className="font-medium">{s.name}</dt>
                  <dd className="text-muted-foreground tabular-nums">
                    {s.registrationNumber}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-5 pb-0">
          <CardTitle className="text-sm">Milestones</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {project.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-4">
              {project.milestones.map((m) => (
                <MilestoneColumn key={m.id} milestone={m} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">
              Advisor&apos;s closure feedback
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Rating the advisor gave the student group
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {project.advisorFeedback ? (
              <RatingRow
                name={project.advisorFeedback.submittedBy}
                feedback={project.advisorFeedback}
              />
            ) : (
              <NotSubmitted />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">
              Student group&apos;s closure feedback
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Rating each student gave the advisor
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 flex flex-col gap-2">
            {project.studentFeedback.every((s) => !s.feedback) ? (
              <NotSubmitted />
            ) : (
              project.studentFeedback.map((s) => (
                <RatingRow
                  key={s.studentName}
                  name={s.studentName}
                  feedback={s.feedback}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
