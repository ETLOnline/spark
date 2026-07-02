"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Users,
  Video,
  X
} from "lucide-react"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetMentorAvailabilityAction,
  UpdateAvailabilityAction
} from "@/src/server-actions/Mentor/MentorActions"
import { toast } from "@/src/hooks/use-toast"
import { cn, toLocalDateStr } from "@/src/lib/utils"
import { SelectMentorAvailability } from "@/src/db/schema"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

// Full day names used for labels; abbreviated headers derived from them
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]
const DAY_HEADERS = DAYS.map((d) => d.slice(0, 3))

export const MIN_DURATION_MINS = 30

export function toMins(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

type ViewType = "month" | "week"
type RepeatType = "none" | "daily" | "weekly"
type SessionType = "1:1" | "group"

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`
}

/** Returns true if this slot should appear on `date`. */
function slotAppliesToDate(
  slot: SelectMentorAvailability,
  date: Date
): boolean {
  if (!slot.date) return false
  const anchor = parseLocalDate(slot.date)
  anchor.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  if (d < anchor) return false

  if (slot.repeat_end_date) {
    const endDate = parseLocalDate(slot.repeat_end_date)
    endDate.setHours(0, 0, 0, 0)
    if (d > endDate) return false
  }

  if (slot.repeat_type === "none") return toLocalDateStr(d) === slot.date
  if (slot.repeat_type === "daily") return true
  if (slot.repeat_type === "weekly") return d.getDay() === anchor.getDay()
  return false
}

function repeatLabel(slot: SelectMentorAvailability) {
  if (slot.repeat_type === "weekly")
    return `Every ${DAYS[parseLocalDate(slot.date).getDay()]}`
  if (slot.repeat_type === "daily") return "Every day"
  return "One-time"
}

/** Last day of the month containing `dateStr`. */
function endOfMonth(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return toLocalDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

/** First occurrence of `targetDow` (0=Sun) on or after `fromDateStr`. */
function nextOccurrence(fromDateStr: string, targetDow: number): string {
  const d = parseLocalDate(fromDateStr)
  d.setDate(d.getDate() + ((targetDow - d.getDay() + 7) % 7))
  return toLocalDateStr(d)
}

// ── Component ──────────────────────────────────────────────────────────────────

interface MentorCalendarProps {
  userId: string
  isMyProfile?: boolean
}

// Stable reference — computed once at module load, not on every render
const TODAY = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})()

export function MentorCalendar({
  userId,
  isMyProfile = false
}: MentorCalendarProps) {
  const today = TODAY

  const [view, setView] = useState<ViewType>("month")
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [slots, setSlots] = useState<SelectMentorAvailability[]>([])

  // Popup state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [newDate, setNewDate] = useState(toLocalDateStr(today))
  const [newStart, setNewStart] = useState("09:00")
  const [newEnd, setNewEnd] = useState("10:00")
  const [newSession, setNewSession] = useState<SessionType>("1:1")
  const [newRepeat, setNewRepeat] = useState<RepeatType>("weekly")
  const [newRepeatDays, setNewRepeatDays] = useState<number[]>([today.getDay()])
  const [newRepeatEnd, setNewRepeatEnd] = useState("")
  const [slotError, setSlotError] = useState("")
  const [saving, setSaving] = useState(false)

  const [, , , getAvailability] = useServerAction(GetMentorAvailabilityAction)
  const [, , , updateAvailability] = useServerAction(UpdateAvailabilityAction)

  const loadSlots = useCallback(async () => {
    const res = await getAvailability(userId)
    if (res?.success && res.data) setSlots(res.data.filter((s) => s.is_active))
  }, [userId])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  // ── Navigation ────────────────────────────────────────────────────────────────

  const goBack = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      )
    } else {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 7)
      setCurrentDate(d)
    }
  }

  const goForward = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      )
    } else {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 7)
      setCurrentDate(d)
    }
  }

  const goToday = () => {
    if (view === "month") {
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    } else {
      const s = new Date(today)
      s.setDate(today.getDate() - today.getDay())
      setCurrentDate(s)
    }
  }

  const switchView = (v: ViewType) => {
    setView(v)
    if (v === "week") {
      const s = new Date(today)
      s.setDate(today.getDate() - today.getDay())
      setCurrentDate(s)
    } else {
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    }
  }

  // ── Calendar cells ────────────────────────────────────────────────────────────

  const monthWeeks = useMemo(() => {
    const y = currentDate.getFullYear(),
      mo = currentDate.getMonth()
    const first = new Date(y, mo, 1).getDay()
    const dim = new Date(y, mo + 1, 0).getDate()
    const prev = new Date(y, mo, 0).getDate()
    const cells: Date[] = []
    for (let i = first - 1; i >= 0; i--)
      cells.push(new Date(y, mo - 1, prev - i))
    for (let d = 1; d <= dim; d++) cells.push(new Date(y, mo, d))
    const rem = 42 - cells.length
    for (let d = 1; d <= rem; d++) cells.push(new Date(y, mo + 1, d))
    const weeks: Date[][] = []
    for (let i = 0; i < 42; i += 7) weeks.push(cells.slice(i, i + 7))
    return weeks
  }, [currentDate])

  const weekDays = useMemo(() => {
    const s = new Date(currentDate)
    s.setDate(s.getDate() - s.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s)
      d.setDate(s.getDate() + i)
      return d
    })
  }, [currentDate])

  // ── Slot helpers ──────────────────────────────────────────────────────────────

  const getSlotsForDate = (date: Date) =>
    slots.filter((s) => slotAppliesToDate(s, date))

  const resetPopupForm = (date: Date) => {
    const dateStr = toLocalDateStr(date)
    setNewDate(dateStr)
    setNewStart("09:00")
    setNewEnd("10:00")
    setNewSession("1:1")
    setNewRepeat("weekly")
    setNewRepeatDays([date.getDay()])
    setNewRepeatEnd(endOfMonth(dateStr))
    setSlotError("")
  }

  const openPopup = (date: Date) => {
    if (!isMyProfile && getSlotsForDate(date).length === 0) return
    setSelectedDate(date)
    resetPopupForm(date)
    setIsPopupOpen(true)
  }

  const handleAddSlot = async () => {
    if (toMins(newEnd) <= toMins(newStart)) {
      setSlotError("End time must be after start time")
      return
    }
    if (toMins(newEnd) - toMins(newStart) < MIN_DURATION_MINS) {
      setSlotError(`Minimum ${MIN_DURATION_MINS} minutes`)
      return
    }
    if (newRepeat === "weekly" && newRepeatDays.length === 0) {
      setSlotError("Select at least one day")
      return
    }

    // Overlap check — two slots conflict if they share at least one day AND their times overlap
    const timesOverlap = (s: SelectMentorAvailability) =>
      toMins(newStart) < toMins(s.end_time) &&
      toMins(s.start_time) < toMins(newEnd)

    const dayOverlaps = (s: SelectMentorAvailability, dow: number) => {
      const sDow = parseLocalDate(s.date).getDay()
      if (s.repeat_type === "daily") return true
      if (s.repeat_type === "none") {
        if (newRepeat === "none") return s.date === newDate
        if (newRepeat === "daily") return true
        if (newRepeat === "weekly") return sDow === dow
      }
      if (s.repeat_type === "weekly") {
        if (newRepeat === "none")
          return sDow === parseLocalDate(newDate).getDay()
        if (newRepeat === "daily") return true
        if (newRepeat === "weekly") return sDow === dow
      }
      return false
    }

    const hasConflict = (dow: number) =>
      slots.some((s) => dayOverlaps(s, dow) && timesOverlap(s))

    if (newRepeat === "weekly") {
      const conflicting = newRepeatDays
        .filter((dow) => hasConflict(dow))
        .map((dow) => DAY_HEADERS[dow])
      if (conflicting.length > 0) {
        setSlotError(`Overlapping slot exists for: ${conflicting.join(", ")}`)
        return
      }
    } else {
      if (hasConflict(parseLocalDate(newDate).getDay())) {
        setSlotError("This slot overlaps with an existing one")
        return
      }
    }

    setSaving(true)
    const repeatEnd =
      newRepeat !== "none" ? newRepeatEnd || endOfMonth(newDate) : null

    const newSlots =
      newRepeat === "weekly"
        ? newRepeatDays.map((dow) => ({
            date: nextOccurrence(newDate, dow),
            start_time: newStart,
            end_time: newEnd,
            session_type: newSession,
            repeat_type: "weekly" as RepeatType,
            repeat_end_date: repeatEnd
          }))
        : [
            {
              date: newDate,
              start_time: newStart,
              end_time: newEnd,
              session_type: newSession,
              repeat_type: newRepeat,
              repeat_end_date: repeatEnd
            }
          ]

    const existing = slots.map((s) => ({
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      session_type: s.session_type,
      repeat_type: s.repeat_type,
      repeat_end_date: s.repeat_end_date ?? null
    }))

    const res = await updateAvailability({
      mentorId: userId,
      slots: [...existing, ...newSlots]
    })
    if (res?.success) {
      await loadSlots()
      toast({ title: "Slot added", duration: 2000 })
    } else {
      toast({
        title: "Failed to add slot",
        variant: "destructive",
        duration: 2000
      })
    }
    setSaving(false)
  }

  const handleRemoveSlot = async (slotId: number) => {
    const remaining = slots
      .filter((s) => s.id !== slotId)
      .map((s) => ({
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        session_type: s.session_type,
        repeat_type: s.repeat_type,
        repeat_end_date: s.repeat_end_date ?? null
      }))
    const res = await updateAvailability({ mentorId: userId, slots: remaining })
    if (res?.success) {
      setSlots((p) => p.filter((s) => s.id !== slotId))
      toast({ title: "Slot removed", duration: 2000 })
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────────

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
  const slotsForSelected = selectedDate ? getSlotsForDate(selectedDate) : []
  const selectedDayName = selectedDate ? DAYS[selectedDate.getDay()] : ""

  // ── Reusable toggle class helper ──────────────────────────────────────────────

  const toggleItemCls = (
    active: boolean,
    first: boolean,
    extraPad = "px-3 py-1.5"
  ) =>
    cn(
      extraPad,
      "text-xs font-medium transition-colors",
      !first && "border-l border-foreground/10",
      active
        ? "bg-primary text-primary-foreground"
        : "hover:bg-muted text-muted-foreground"
    )

  // ── Cell render ───────────────────────────────────────────────────────────────

  const renderCell = (date: Date, inMonth: boolean) => {
    const daySlots = getSlotsForDate(date)
    const clickable = isMyProfile || daySlots.length > 0
    return (
      <div
        key={date.toISOString()}
        onClick={() => openPopup(date)}
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
        {daySlots.slice(0, 2).map((slot) => (
          <div
            key={slot.id}
            title={`${slot.session_type === "group" ? "Group" : "1-on-1"} · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`}
            className="text-[10px] leading-tight truncate rounded px-1 py-0.5 bg-primary/20 text-primary font-medium flex items-center gap-0.5"
          >
            {slot.session_type === "group" ? (
              <Users className="h-2.5 w-2.5 shrink-0" />
            ) : (
              <Video className="h-2.5 w-2.5 shrink-0" />
            )}
            {formatTime(slot.start_time)}
          </div>
        ))}
        {daySlots.length > 2 && (
          <span className="text-[10px] text-muted-foreground px-1">
            +{daySlots.length - 2} more
          </span>
        )}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
              onClick={() => {
                setSelectedDate(today)
                resetPopupForm(today)
                setIsPopupOpen(true)
              }}
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

      {/* ── Popup ── */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 flex flex-col max-h-[90dvh]">
          <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
            <DialogTitle className="text-lg font-semibold">
              {isMyProfile
                ? "New Availability Slot"
                : `${selectedDayName} Availability`}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
            {isMyProfile && (
              <>
                {/* Session Type */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Session Type
                  </Label>
                  <div className="flex rounded-md border border-foreground/10 overflow-hidden">
                    {(["1:1", "group"] as SessionType[]).map((t, i) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewSession(t)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                          i > 0 && "border-l border-foreground/10",
                          newSession === t
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {t === "group" ? (
                          <Users className="h-3.5 w-3.5" />
                        ) : (
                          <Video className="h-3.5 w-3.5" />
                        )}
                        {t === "1:1" ? "1-on-1" : "Group"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => {
                      setNewDate(e.target.value)
                      if (e.target.value)
                        setNewRepeatEnd(endOfMonth(e.target.value))
                    }}
                  />
                </div>

                {/* Start / End */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Start
                    </Label>
                    <Input
                      type="time"
                      value={newStart}
                      onChange={(e) => {
                        setNewStart(e.target.value)
                        setSlotError("")
                      }}
                      className={cn(slotError && "border-destructive")}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      End
                    </Label>
                    <Input
                      type="time"
                      value={newEnd}
                      onChange={(e) => {
                        setNewEnd(e.target.value)
                        setSlotError("")
                      }}
                      className={cn(slotError && "border-destructive")}
                    />
                  </div>
                </div>

                {slotError && (
                  <p className="text-destructive text-xs">{slotError}</p>
                )}

                {/* Repeat */}
                <div className="flex items-center justify-between rounded-lg border border-foreground/8 px-3 py-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span>Repeat</span>
                  </div>
                  <div className="flex rounded-md border border-foreground/10 overflow-hidden">
                    {(["none", "daily", "weekly"] as RepeatType[]).map(
                      (r, i) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNewRepeat(r)}
                          className={toggleItemCls(
                            newRepeat === r,
                            i === 0,
                            "px-2.5 py-1"
                          )}
                        >
                          {r === "none"
                            ? "None"
                            : r === "daily"
                              ? "Daily"
                              : "Weekly"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Day-of-week picker */}
                {newRepeat === "weekly" && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Repeat on
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAY_HEADERS.map((label, dow) => {
                        const active = newRepeatDays.includes(dow)
                        return (
                          <button
                            key={dow}
                            type="button"
                            onClick={() => {
                              setSlotError("")
                              setNewRepeatDays((prev) =>
                                prev.includes(dow)
                                  ? prev.filter((d) => d !== dow)
                                  : [...prev, dow]
                              )
                            }}
                            className={cn(
                              "flex-1 min-w-[36px] py-1.5 text-[11px] font-semibold rounded-md border transition-colors",
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-foreground/10 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Repeat until */}
                {newRepeat !== "none" && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Repeat until{" "}
                      <span className="opacity-60">(optional)</span>
                    </Label>
                    <Input
                      type="date"
                      value={newRepeatEnd}
                      min={newDate}
                      onChange={(e) => setNewRepeatEnd(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {/* Slot list */}
            {slotsForSelected.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {isMyProfile ? "Existing Slots" : "Available Times"}
                  {slotsForSelected.length > 2 && (
                    <span className="ml-1.5 normal-case font-normal opacity-60">
                      ({slotsForSelected.length})
                    </span>
                  )}
                </p>
                <div className="space-y-1.5 max-h-[152px] overflow-y-auto pr-0.5">
                  {slotsForSelected.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg border border-foreground/8 px-3 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {slot.session_type === "group" ? (
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate">
                            {formatTime(slot.start_time)} –{" "}
                            {formatTime(slot.end_time)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {repeatLabel(slot)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground border border-foreground/10 rounded px-1.5 py-0.5 shrink-0">
                          {slot.session_type === "group" ? "Group" : "1-on-1"}
                        </span>
                      </div>
                      {isMyProfile && (
                        <button
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="h-6 w-6 flex items-center justify-center shrink-0 rounded text-destructive hover:bg-destructive/10 transition-colors ml-2"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isMyProfile && slotsForSelected.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No availability set for this day
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-foreground/8 shrink-0">
            <button
              onClick={() => setIsPopupOpen(false)}
              className="px-4 py-2 text-sm font-medium hover:text-foreground text-muted-foreground transition-colors"
            >
              {isMyProfile ? "Cancel" : "Close"}
            </button>
            {isMyProfile && (
              <Button
                onClick={handleAddSlot}
                loading={saving}
                className="h-9 px-5 text-sm rounded-lg"
              >
                Add Slot
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
