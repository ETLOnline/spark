"use client"

import { useMemo, useState } from "react"
import moment from "moment-timezone"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Plus,
  Sparkles,
  Users,
  Video
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import { SelectMentorAvailability, SelectSessionRequest } from "@/src/db/schema"
import { DAY_HEADERS, MONTH_NAMES } from "@/src/utils/constants"
import {
  countOverlappingRequests,
  formatTime,
  getSlotsForDate,
  isPastDate,
  isSlotFullyBooked,
  myAcceptedRequestsFor,
  myPendingRequestFor,
  toggleItemCls,
  ViewType
} from "./mentorCalendarUtils"

interface MentorCalendarGridProps {
  today: Date
  slots: SelectMentorAvailability[]
  isMyProfile: boolean
  myRequests: SelectSessionRequest[]
  bookedRequests: SelectSessionRequest[]
  mentorPendingRequests: SelectSessionRequest[]
  mentorAcceptedRequests: SelectSessionRequest[]
  onSelectDate: (date: Date) => void
  onNewSlotClick: () => void
}

export function MentorCalendarGrid({
  today,
  slots,
  isMyProfile,
  myRequests,
  bookedRequests,
  mentorPendingRequests,
  mentorAcceptedRequests,
  onSelectDate,
  onNewSlotClick
}: MentorCalendarGridProps) {
  const [view, setView] = useState<ViewType>("month")
  const [currentDate, setCurrentDate] = useState(
    moment(today).startOf("month").toDate()
  )

  const goBack = () => {
    if (view === "month") {
      setCurrentDate(
        moment(currentDate).subtract(1, "month").startOf("month").toDate()
      )
    } else {
      setCurrentDate(moment(currentDate).subtract(7, "days").toDate())
    }
  }

  const goForward = () => {
    if (view === "month") {
      setCurrentDate(
        moment(currentDate).add(1, "month").startOf("month").toDate()
      )
    } else {
      setCurrentDate(moment(currentDate).add(7, "days").toDate())
    }
  }

  const goToday = () => {
    if (view === "month") {
      setCurrentDate(moment(today).startOf("month").toDate())
    } else {
      setCurrentDate(moment(today).startOf("week").toDate())
    }
  }

  const switchView = (v: ViewType) => {
    setView(v)
    if (v === "week") {
      setCurrentDate(moment(today).startOf("week").toDate())
    } else {
      setCurrentDate(moment(today).startOf("month").toDate())
    }
  }

  const monthWeeks = useMemo(() => {
    const m = moment(currentDate).startOf("month")
    const first = m.day()
    const dim = m.daysInMonth()
    const prevEnd = m.clone().subtract(1, "day")
    const cells: Date[] = []
    for (let i = first - 1; i >= 0; i--)
      cells.push(prevEnd.clone().subtract(i, "days").toDate())
    for (let d = 1; d <= dim; d++) cells.push(m.clone().date(d).toDate())
    const rem = 42 - cells.length
    const nextStart = m.clone().add(1, "month").startOf("month")
    for (let d = 1; d <= rem; d++)
      cells.push(nextStart.clone().date(d).toDate())
    const weeks: Date[][] = []
    for (let i = 0; i < 42; i += 7) weeks.push(cells.slice(i, i + 7))
    return weeks
  }, [currentDate])

  const weekDays = useMemo(() => {
    const startOfWeek = moment(currentDate).startOf("week")
    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.clone().add(i, "days").toDate()
    )
  }, [currentDate])

  const year = currentDate.getFullYear(),
    month = currentDate.getMonth()

  const headerLabel = useMemo(() => {
    if (view === "month") return `${MONTH_NAMES[month]} ${year}`
    const s = weekDays[0],
      e = weekDays[6]
    if (!s || !e) return ""
    return s.getMonth() === e.getMonth()
      ? `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
      : `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  }, [view, month, year, weekDays])

  const isCurrentMonth = (d: Date) =>
    d.getMonth() === month && d.getFullYear() === year
  const isToday = (d: Date) => d.toDateString() === today.toDateString()

  // Keys for all slot_suggested occurrences this mentee was offered
  const suggestedOccurrenceKeys = useMemo(() => {
    const keys = new Set<string>()
    myRequests
      .filter((r) => r.status === "slot_suggested")
      .forEach((r) => {
        ;((r.suggested_slot_ids ?? []) as unknown as string[]).forEach((k) =>
          keys.add(k)
        )
      })
    return keys
  }, [myRequests])

  const renderCell = (date: Date, inMonth: boolean) => {
    const daySlots = getSlotsForDate(slots, date)
    const clickable = isMyProfile || (daySlots.length > 0 && !isPastDate(date))
    const dateStr = moment(date).format("YYYY-MM-DD")
    return (
      <div
        key={date.toISOString()}
        onClick={() => onSelectDate(date)}
        className={cn(
          "border-r border-foreground/5 last:border-r-0 p-1 flex flex-col gap-0.5 transition-colors min-h-0 overflow-hidden",
          clickable
            ? "cursor-pointer hover:bg-foreground/[0.02]"
            : "cursor-default",
          !inMonth && "opacity-40"
        )}
      >
        <div className="flex items-center justify-start">
          <span
            className={cn(
              "text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium",
              isToday(date)
                ? "bg-primary text-primary-foreground"
                : "text-foreground"
            )}
          >
            {date.getDate()}
          </span>
        </div>
        {daySlots.slice(0, 2).map((slot) => {
          const suggested =
            !isMyProfile && suggestedOccurrenceKeys.has(`${slot.id}-${dateStr}`)
          const myAccepted =
            !isMyProfile &&
            !suggested &&
            myAcceptedRequestsFor(slot, date, myRequests).length > 0
          const booked =
            !isMyProfile &&
            !suggested &&
            !myAccepted &&
            isSlotFullyBooked(slot, date, bookedRequests)
          const pending =
            !booked &&
            !suggested &&
            !myAccepted &&
            !isMyProfile &&
            myPendingRequestFor(slot, date, myRequests)

          // Mentor's own view: surface activity from ALL mentees at a glance.
          const pendingCount = isMyProfile
            ? countOverlappingRequests(slot, date, mentorPendingRequests)
            : 0
          const acceptedCount = isMyProfile
            ? countOverlappingRequests(slot, date, mentorAcceptedRequests)
            : 0

          return (
            <div
              key={slot.id}
              title={
                suggested
                  ? `Suggested · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                  : myAccepted
                    ? `Booked by you · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                    : booked
                      ? `Booked · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                      : pending
                        ? `Pending request · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                        : isMyProfile && pendingCount > 0
                          ? `${pendingCount} pending request${pendingCount > 1 ? "s" : ""} · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                          : `${slot.session_type === "group" ? "Group" : "1-on-1"} · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
              }
              className={cn(
                "text-[10px] leading-tight rounded px-1 py-0.5 font-medium flex items-center gap-1",
                suggested
                  ? "bg-purple-500/20 text-purple-600"
                  : myAccepted
                    ? "bg-emerald-500/15 text-emerald-600"
                    : booked
                      ? "bg-foreground/10 text-muted-foreground"
                      : pending
                        ? "bg-amber-500/20 text-amber-600"
                        : "bg-primary/20 text-primary"
              )}
            >
              {suggested ? (
                <Sparkles className="h-2.5 w-2.5 shrink-0" />
              ) : myAccepted ? (
                <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
              ) : booked ? (
                <Lock className="h-2.5 w-2.5 shrink-0" />
              ) : pending ? (
                <Clock className="h-2.5 w-2.5 shrink-0" />
              ) : slot.session_type === "group" ? (
                <Users className="h-2.5 w-2.5 shrink-0" />
              ) : (
                <Video className="h-2.5 w-2.5 shrink-0" />
              )}
              <span className="truncate">
                {suggested
                  ? "Suggested"
                  : myAccepted
                    ? "Booked by you"
                    : booked
                      ? "Booked"
                      : pending
                        ? "Pending"
                        : formatTime(slot.start_time)}
              </span>
              {isMyProfile && pendingCount > 0 && (
                <span className="ml-auto shrink-0 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
                  {pendingCount}
                </span>
              )}
              {isMyProfile && pendingCount === 0 && acceptedCount > 0 && (
                <span className="ml-auto shrink-0 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              )}
            </div>
          )
        })}
        {daySlots.length > 2 && (
          <span className="text-[10px] text-muted-foreground px-1">
            +{daySlots.length - 2} more
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-foreground/5 shrink-0 gap-2">
        {/* Left: nav + title */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={goBack}
              className="inline-flex shrink-0 items-center justify-center size-8 rounded-lg border border-transparent hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToday}
              className="inline-flex shrink-0 items-center justify-center h-7 px-2.5 rounded-[min(var(--radius-md),12px)] border border-transparent text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
            >
              Today
            </button>
            <button
              onClick={goForward}
              className="inline-flex shrink-0 items-center justify-center size-8 rounded-lg border border-transparent hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-sm font-semibold truncate">{headerLabel}</h2>

          {/* Month/Week toggle — visible on mobile inside left row */}
          <div className="flex sm:hidden rounded-md border border-foreground/10 overflow-hidden ml-auto">
            {(["month", "week"] as ViewType[]).map((v, i) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={toggleItemCls(
                  view === v,
                  i === 0,
                  "px-2.5 py-1.5 capitalize"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Right: toggle (desktop) + New Slot */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex rounded-md border border-foreground/10 overflow-hidden">
            {(["month", "week"] as ViewType[]).map((v, i) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={toggleItemCls(
                  view === v,
                  i === 0,
                  "px-3 py-1.5 capitalize"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {isMyProfile && (
            <button
              onClick={onNewSlotClick}
              className="inline-flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-[min(var(--radius-md),12px)] bg-primary text-primary-foreground text-[0.8rem] font-medium transition-colors hover:bg-primary/80 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-7 border-b border-foreground/5 shrink-0">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {view === "month" && (
            <div className="flex-1 grid grid-rows-6 overflow-hidden">
              {monthWeeks.map((week, wi) => (
                <div
                  key={wi}
                  className="grid grid-cols-7 border-b border-foreground/5 last:border-b-0 min-h-0"
                >
                  {week.map((date) => renderCell(date, isCurrentMonth(date)))}
                </div>
              ))}
            </div>
          )}

          {view === "week" && (
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-7 h-full">
                {weekDays.map((date) => renderCell(date, true))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
