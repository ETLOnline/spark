"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import moment from "moment-timezone"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Skeleton } from "@/src/components/ui/skeleton"
import PaginationComponent from "@/src/components/common/Pagination"
import type { PaginationType } from "@/src/components/common/types/pagination.type"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetAvailabilitySlotsListAction } from "@/src/server-actions/Mentor/MentorActions"
import type { AvailabilitySlotItem } from "@/src/types/Mentorship/Mentorship"
import { formatTime } from "@/src/components/Dashboard/profile/mentor-calendar/mentorCalendarUtils"

const LIMIT = 8

interface AvailabilitySlotsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AvailabilitySlotsModal({
  open,
  onOpenChange
}: AvailabilitySlotsModalProps) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{
    slots: AvailabilitySlotItem[]
    pagination: PaginationType
  }>({
    slots: [],
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
          <DialogTitle>Availability slots</DialogTitle>
          <DialogDescription>
            Every open time slot mentors have published, across all mentors.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-[22rem] overflow-y-auto">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}

          {!loading && data.slots.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No availability slots found.
            </p>
          )}

          {!loading &&
            data.slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{slot.mentorName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {slot.mentorEmail}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0 text-right">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {moment(slot.date).format("MMM D, YYYY")} ·{" "}
                    {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                  </span>
                </div>
              </div>
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
