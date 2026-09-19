"use client"

import { Check, Clock, Circle } from "lucide-react"
import type { MilestoneWithArtifacts } from "@/src/server-actions/Milestone/Milestone"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"

export function MilestoneStepper({
  milestones
}: {
  milestones: MilestoneWithArtifacts[]
}) {
  const completed = milestones.filter(
    (m) => m.status === MilestoneStatus.VERIFIED
  ).length
  const pending = milestones.filter(
    (m) => m.status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION
  ).length
  const inProgress = milestones.filter(
    (m) => m.status === MilestoneStatus.IN_PROGRESS
  ).length
  const total = milestones.length
  const progressPct = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-xl border bg-card p-4 mb-6 space-y-4">
      {/* Summary row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            {completed} Completed
          </span>
          {pending > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
              {pending} Pending Verification
            </span>
          )}
          {inProgress > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
              {inProgress} In progress
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30 inline-block" />
            {total - completed - pending - inProgress} Incomplete
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {completed}/{total} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step nodes */}
      <div className="flex items-start overflow-x-auto pb-1 pt-1">
        {milestones.map((m, i) => {
          const isCompleted = m.status === MilestoneStatus.VERIFIED
          const isPending =
            m.status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION
          const isInProgress = m.status === MilestoneStatus.IN_PROGRESS
          const isLast = i === milestones.length - 1

          // Node ring + fill
          const nodeClass = isCompleted
            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
            : isPending
              ? "border-amber-400 bg-amber-400/10 text-amber-500"
              : isInProgress
                ? "border-blue-500 bg-blue-500/10 text-blue-500"
                : "border-muted-foreground/25 bg-background text-muted-foreground/40"

          // Label colour
          const labelClass = isCompleted
            ? "text-emerald-600 dark:text-emerald-400"
            : isPending
              ? "text-amber-500"
              : isInProgress
                ? "text-blue-500"
                : "text-muted-foreground/60"

          // Status badge text
          const statusText = isCompleted
            ? "Verified"
            : isPending
              ? "Pending Verification"
              : isInProgress
                ? "In Progress"
                : "Not Started"

          // Connector line: solid green only after a completed step
          const lineClass = isCompleted
            ? "bg-emerald-400"
            : "bg-muted-foreground/15"

          // Icon inside circle
          const nodeIcon = isCompleted ? (
            <Check className="h-3.5 w-3.5" />
          ) : isPending ? (
            <Clock className="h-3.5 w-3.5" />
          ) : isInProgress ? (
            <Circle className="h-2.5 w-2.5 fill-current" />
          ) : (
            <span className="text-xs font-semibold">{i + 1}</span>
          )

          return (
            <div key={m.id} className="flex items-start flex-1 min-w-0">
              {/* Node + label */}
              <div className="flex flex-col items-center gap-1.5 min-w-[68px]">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${nodeClass}`}
                >
                  {nodeIcon}
                </div>
                <span
                  className={`text-[11px] text-center leading-tight max-w-[68px] font-medium ${labelClass}`}
                >
                  {m.name}
                </span>
                <span className="text-[10px] text-muted-foreground/50 text-center leading-tight max-w-[68px]">
                  {statusText}
                </span>
              </div>

              {/* Connector line (not after last node) */}
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-1 mt-[15px] rounded-full transition-colors ${lineClass}`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
