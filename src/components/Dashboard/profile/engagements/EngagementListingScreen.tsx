"use client"

import { useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { ArrowLeft, ArrowRight, Users } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import {
  deriveEngagementStatus,
  Engagement,
  EngagementStatus,
  FeedbackItem
} from "./types"
import { StatusPill } from "./StatusPill"
import { EngagementDetail } from "./EngagementDetail"
import { CompletionDialog } from "./CompletionDialog"
import { FeedbackDialog } from "./FeedbackDialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  ArchiveSpaceAction,
  ConfirmSessionCompletionAction,
  GetEngagementFeedbackAction,
  GetEngagementsAction,
  SubmitMentorshipFeedbackAction
} from "@/src/server-actions/Mentor/MentorActions"
import { toast } from "@/src/hooks/use-toast"
import moment from "moment"

type Tab = "all" | EngagementStatus

// ── List item ─────────────────────────────────────────────────────────────────

function EngagementListItem({
  e,
  selected,
  onSelect
}: {
  e: Engagement
  selected: boolean
  onSelect: () => void
}) {
  const isGroupMentor = e.sessionType === "group" && e.isMentor
  const isGroupMentee = e.sessionType === "group" && !e.isMentor
  const dateStr = moment(e.sessionDate).format("ddd MMM D")
  const dateLabel = `${dateStr} · ${e.sessionType}`

  let subtitle: string
  if (isGroupMentor) {
    subtitle = `Group · ${e.attendeeCount ?? 0} participant${(e.attendeeCount ?? 0) !== 1 ? "s" : ""} · ${dateStr}`
  } else if (isGroupMentee) {
    subtitle = `Group · ${e.counterpart.name} · ${dateStr}`
  } else {
    subtitle = `${e.counterpart.name} · ${dateLabel}`
  }

  return (
    <Button
      variant="ghost"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 border-b border-foreground/5 last:border-b-0 text-left transition-colors h-auto rounded-none justify-start",
        "hover:!text-foreground",
        selected
          ? "bg-foreground/[0.04] hover:!bg-foreground/[0.04]"
          : "hover:!bg-foreground/[0.02]",
        e.status === "overdue" && !selected && "bg-red-500/[0.02]"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold",
          e.status === "overdue"
            ? "bg-red-100 text-red-700"
            : e.status === "upcoming"
              ? "bg-blue-100 text-blue-700"
              : e.status === "open"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
        )}
      >
        {isGroupMentor ? <Users className="h-4 w-4" /> : e.counterpart.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{e.topic}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={e.status} />
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </Button>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-foreground/[0.02] border-b border-foreground/5">
      {label}
    </div>
  )
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5"
        >
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      ))}
    </>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function EngagementListingScreen() {
  const authUser = useAtomValue(userStore.AuthUser)
  const [tab, setTab] = useState<Tab>("all")
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [selected, setSelected] = useState<Engagement | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [loading, , , fetchEngagements] = useServerAction(GetEngagementsAction)
  const [confirming, , , confirmCompletion] = useServerAction(
    ConfirmSessionCompletionAction
  )
  const [submittingFeedback, , , submitFeedback] = useServerAction(
    SubmitMentorshipFeedbackAction
  )
  const [archiving, , , archiveSpace] = useServerAction(ArchiveSpaceAction)
  const [feedbackLoading, , , fetchFeedback] = useServerAction(
    GetEngagementFeedbackAction
  )

  const reload = async (keepId?: number) => {
    const res = await fetchEngagements()
    if (res?.success && res.data) {
      const data = res.data.map((e) => ({
        ...e,
        status: deriveEngagementStatus(e)
      }))
      setEngagements(data)
      const keep = keepId
        ? (data.find((e) => e.id === keepId) ?? data[0])
        : (data.find((e) => e.status === "overdue") ?? data[0])
      setSelected(keep ?? null)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  useEffect(() => {
    if (selected?.status === "completed") {
      fetchFeedback(selected.id).then((res) => {
        if (res?.success && res.data) setFeedbackItems(res.data)
        else setFeedbackItems([])
      })
    } else {
      setFeedbackItems([])
    }
  }, [selected?.id])

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "overdue", label: "Overdue" },
    { key: "open", label: "Open" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" }
  ]

  const filtered =
    tab === "all" ? engagements : engagements.filter((e) => e.status === tab)

  const overdue = filtered.filter((e) => e.status === "overdue")
  const open = filtered.filter((e) => e.status === "open")
  const upcoming = filtered.filter((e) => e.status === "upcoming")
  const completed = filtered.filter((e) => e.status === "completed")

  const handleConfirmComplete = async () => {
    if (!selected) return
    const res = await confirmCompletion(selected.id)
    if (res?.success) {
      setShowCompletion(false)
      await reload(selected.id)
    }
  }

  const handleSubmitFeedback = async (
    rating: number,
    comment: string,
    visibility: "public" | "private"
  ) => {
    if (!selected) return
    const res = await submitFeedback(selected.id, rating, comment, visibility)
    if (res?.success) {
      setShowFeedback(false)
      await reload(selected.id)
      // Refresh feedback panel
      const fbRes = await fetchFeedback(selected.id)
      if (fbRes?.success && fbRes.data) setFeedbackItems(fbRes.data)
    }
  }

  const handleArchiveSpace = async () => {
    if (!selected?.spaceId) return
    if (selected.spaceCreatedBy !== authUser?.unique_id) {
      toast({
        title: "Not allowed",
        description: "Only the space creator can archive this space.",
        variant: "destructive"
      })
      return
    }
    const res = await archiveSpace(selected.id)
    if (res?.success) {
      toast({
        title: "Space archived",
        description: `"${selected.spaceName}" has been archived and is now read-only.`
      })
      // Optimistic patch — avoid full page re-render
      const updated: Engagement = { ...selected, isSpaceArchived: true }
      setSelected(updated)
      // For group sessions, patch all sibling engagements sharing the same slot
      const siblingIds = new Set(
        selected.groupSessionRequestIds ?? [selected.id]
      )
      setEngagements((prev) =>
        prev.map((e) =>
          e.id === selected.id || siblingIds.has(e.id)
            ? { ...e, isSpaceArchived: true }
            : e
        )
      )
    } else {
      toast({
        title: "Failed to archive space",
        description:
          typeof res?.error === "string"
            ? res.error
            : "Something went wrong. Please try again.",
        variant: "destructive"
      })
    }
  }

  const renderList = (list: Engagement[]) =>
    list.map((e) => (
      <EngagementListItem
        key={e.id}
        e={e}
        selected={selected?.id === e.id}
        onSelect={() => {
          setSelected(e)
          setShowDetail(true)
        }}
      />
    ))

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: list panel ── */}
      <div
        className={cn(
          "flex flex-col border-r border-foreground/5 overflow-hidden",
          "lg:w-[380px] lg:shrink-0 lg:flex",
          showDetail ? "hidden" : "flex w-full"
        )}
      >
        {/* Tabs */}
        <div className="flex border-b border-foreground/5 shrink-0">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant="ghost"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex-1 py-2.5 text-xs font-medium transition-colors h-auto rounded-none",
                tab === t.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-foreground rounded-full" />
              )}
            </Button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <SkeletonRows />
          ) : tab === "all" ? (
            <>
              {overdue.length > 0 && (
                <>
                  <SectionLabel label="Overdue — Feedback Pending" />
                  {renderList(overdue)}
                </>
              )}
              {open.length > 0 && (
                <>
                  <SectionLabel label="Open" />
                  {renderList(open)}
                </>
              )}
              {upcoming.length > 0 && (
                <>
                  <SectionLabel label="Upcoming" />
                  {renderList(upcoming)}
                </>
              )}
              {completed.length > 0 && (
                <>
                  <SectionLabel label="Completed" />
                  {renderList(completed)}
                </>
              )}
              {filtered.length === 0 && (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  No engagements yet
                </div>
              )}
            </>
          ) : (
            <>
              {renderList(filtered)}
              {filtered.length === 0 && (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  No {tab} engagements
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right: detail panel ── */}
      <div
        className={cn(
          "flex-1 overflow-y-auto flex flex-col",
          "lg:flex",
          showDetail ? "flex w-full" : "hidden"
        )}
      >
        {/* Back button — mobile only */}
        <Button
          variant="ghost"
          onClick={() => setShowDetail(false)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground border-b border-foreground/5 shrink-0 hover:text-foreground transition-colors h-auto rounded-none justify-start"
        >
          <ArrowLeft className="h-4 w-4" />
          All engagements
        </Button>

        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <EngagementDetail
              engagement={selected}
              onComplete={() => setShowCompletion(true)}
              onFeedback={() => setShowFeedback(true)}
              onArchive={handleArchiveSpace}
              isArchiving={archiving}
              feedbackItems={feedbackItems}
              feedbackLoading={feedbackLoading}
            />
          ) : (
            !loading && (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Select an engagement to view details
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      {selected && (
        <>
          <CompletionDialog
            open={showCompletion}
            onClose={() => setShowCompletion(false)}
            onConfirm={handleConfirmComplete}
            topic={selected.topic}
            isLoading={confirming}
          />
          <FeedbackDialog
            open={showFeedback}
            onClose={() => setShowFeedback(false)}
            onSubmit={handleSubmitFeedback}
            counterpartName={selected.counterpart.name}
            isLoading={submittingFeedback}
          />
        </>
      )}
    </div>
  )
}
