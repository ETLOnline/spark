"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Clock } from "lucide-react"
import moment from "moment-timezone"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/src/components/ui/collapsible"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"
import PaginationComponent from "@/src/components/common/Pagination"
import type { PaginationType } from "@/src/components/common/types/pagination.type"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetAvailabilitySlotsListAction } from "@/src/server-actions/Mentor/MentorActions"
import type {
  AvailabilitySlotItem,
  MentorAvailabilityGroup
} from "@/src/types/Mentorship/Mentorship"
import { formatTime } from "@/src/components/Dashboard/profile/mentor-calendar/mentorCalendarUtils"
import { cn } from "@/src/lib/utils"

const LIMIT = 8

interface AvailabilitySlotsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SlotTime({ slot }: { slot: AvailabilitySlotItem }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0 text-right">
      <Clock className="w-3.5 h-3.5" />
      <span>
        {moment(slot.date).format("MMM D, YYYY")} · {formatTime(slot.startTime)}
        –{formatTime(slot.endTime)}
      </span>
    </div>
  )
}

function MentorAvailabilityRow({
  mentor
}: {
  mentor: MentorAvailabilityGroup
}) {
  const [expanded, setExpanded] = useState(false)
  const [nearest, ...rest] = mentor.slots

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="rounded-lg border px-3 py-2.5 text-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{mentor.mentorName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {mentor.mentorEmail}
          </p>
        </div>
        <SlotTime slot={nearest} />
      </div>

      {rest.length > 0 && (
        <>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1.5 h-auto gap-1 px-1.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
            >
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  expanded && "rotate-180"
                )}
              />
              {expanded
                ? "Hide slots"
                : `View ${rest.length} more slot${rest.length === 1 ? "" : "s"}`}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 flex flex-col gap-1.5 rounded-md bg-muted/40 p-2">
            {rest.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {moment(slot.date).format("MMM D, YYYY")} ·{" "}
                  {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </>
      )}
    </Collapsible>
  )
}

export function AvailabilitySlotsModal({
  open,
  onOpenChange
}: AvailabilitySlotsModalProps) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{
    mentors: MentorAvailabilityGroup[]
    pagination: PaginationType
  }>({
    mentors: [],
    pagination: { total: 0, page: 1, limit: LIMIT, totalPages: 0 }
  })
  const [loading, , , fetchSlots] = useServerAction(
    GetAvailabilitySlotsListAction
  )

  useEffect(() => {
    if (!open) return
    const load = async () => {
      const result = await fetchSlots(page, LIMIT)
      if (!result?.success || !result.data) return
      setData(result.data)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setPage(1)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Availability slots
            {data.pagination.total > 0 && (
              <Badge variant="secondary">{data.pagination.total} mentors</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Every mentor with an open, not-yet-expired time slot — nearest
            upcoming slot first.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-[22rem] overflow-y-auto">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}

          {!loading && data.mentors.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No availability slots found.
            </p>
          )}

          {!loading &&
            data.mentors.map((mentor) => (
              <MentorAvailabilityRow key={mentor.mentorId} mentor={mentor} />
            ))}
        </div>

        {!loading && data.pagination.totalPages > 1 && (
          <div className="overflow-x-auto">
            <PaginationComponent
              pagination={data.pagination}
              onPageChange={setPage}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
