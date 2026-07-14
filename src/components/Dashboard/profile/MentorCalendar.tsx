"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  RefreshCw,
  Users,
  Video,
  X
} from "lucide-react"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSessionRequestAction,
  DeleteSessionRequestsForRemovedSlotAction,
  GetMentorAvailabilityAction,
  GetMySessionRequestsForMentorAction,
  UpdateAvailabilityAction
} from "@/src/server-actions/Mentor/MentorActions"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { GetUserRewardBalanceAction } from "@/src/server-actions/Reward/Reward"
import { toast } from "@/src/hooks/use-toast"
import { cn } from "@/src/lib/utils"
import { SelectMentorAvailability, SelectSessionRequest } from "@/src/db/schema"
import moment from "moment-timezone"
import {
  DAY_HEADERS,
  DAYS,
  MONTH_NAMES,
  REPUTATION_POINTS_REWARD_ID,
  RP_THRESHOLD
} from "@/src/utils/constants"
import { MIN_DURATION_MINS, toMins } from "@/src/utils/time"

type ViewType = "month" | "week"
type RepeatType = "none" | "daily" | "weekly"
type SessionType = "1:1" | "group"

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format a HH:mm string to 12-hour display. */
function formatTime(time: string) {
  return moment(time, "HH:mm").format("h:mm A")
}

function minsToTime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`
  const hours = mins / 60
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hr`
}

/** Start times a mentee can pick, stepped every hour, leaving room for at least a 1-hour session. */
function getStartTimeOptions(slot: SelectMentorAvailability) {
  const options: string[] = []
  const startMin = toMins(slot.start_time)
  const endMin = toMins(slot.end_time)
  for (let t = startMin; t <= endMin - 60; t += 60) {
    options.push(minsToTime(t))
  }
  return options
}

/** Durations that fit between `startTime` and the slot's end, in clean 1-hour steps — scales to however long the mentor made themselves available. */
function getDurationOptions(slot: SelectMentorAvailability, startTime: string) {
  const remaining = toMins(slot.end_time) - toMins(startTime)
  const options: number[] = []
  for (let d = 60; d <= remaining; d += 60) {
    options.push(d)
  }
  return options
}

/** Returns true if this slot should appear on `date`. */
function slotAppliesToDate(
  slot: SelectMentorAvailability,
  date: Date
): boolean {
  if (!slot.date) return false
  const anchor = moment(slot.date, "YYYY-MM-DD")
  const d = moment(date).startOf("day")

  if (d.isBefore(anchor)) return false

  if (slot.repeat_end_date) {
    const endDate = moment(slot.repeat_end_date, "YYYY-MM-DD")
    if (d.isAfter(endDate)) return false
  }

  if (slot.repeat_type === "none") return d.format("YYYY-MM-DD") === slot.date
  if (slot.repeat_type === "daily") return true
  if (slot.repeat_type === "weekly") return d.day() === anchor.day()
  return false
}

function repeatLabel(slot: SelectMentorAvailability) {
  if (slot.repeat_type === "weekly")
    return `Every ${DAYS[moment(slot.date, "YYYY-MM-DD").day()]}`
  if (slot.repeat_type === "daily") return "Every day"
  return "One-time"
}

/** Last day of the month containing `dateStr`. */
function endOfMonth(dateStr: string): string {
  return moment(dateStr, "YYYY-MM-DD").endOf("month").format("YYYY-MM-DD")
}

/** First occurrence of `targetDow` (0=Sun) on or after `fromDateStr`. */
function nextOccurrence(fromDateStr: string, targetDow: number): string {
  const m = moment(fromDateStr, "YYYY-MM-DD")
  const diff = (targetDow - m.day() + 7) % 7
  return m.clone().add(diff, "days").format("YYYY-MM-DD")
}

// ── Component ──────────────────────────────────────────────────────────────────

interface MentorCalendarProps {
  userId: string
  isMyProfile?: boolean
}

// Stable reference — computed once at module load, not on every render
const TODAY = moment().startOf("day").toDate()

export function MentorCalendar({
  userId,
  isMyProfile = false
}: MentorCalendarProps) {
  const today = TODAY

  const [view, setView] = useState<ViewType>("month")
  const [currentDate, setCurrentDate] = useState(
    moment(today).startOf("month").toDate()
  )
  const [slots, setSlots] = useState<SelectMentorAvailability[]>([])

  // Popup state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [newDate, setNewDate] = useState(moment(today).format("YYYY-MM-DD"))
  const [newStart, setNewStart] = useState("09:00")
  const [newEnd, setNewEnd] = useState("10:00")
  const [newSession, setNewSession] = useState<SessionType>("1:1")
  const [newRepeat, setNewRepeat] = useState<RepeatType>("weekly")
  const [newRepeatDays, setNewRepeatDays] = useState<number[]>([today.getDay()])
  const [newRepeatEnd, setNewRepeatEnd] = useState("")
  const [slotError, setSlotError] = useState("")
  const [saving, setSaving] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  // Request-a-session form state (viewer only)
  const [viewerRp, setViewerRp] = useState(0)
  const [myRequests, setMyRequests] = useState<SelectSessionRequest[]>([])
  const [requestFormSlot, setRequestFormSlot] =
    useState<SelectMentorAvailability | null>(null)
  const [requestStartTime, setRequestStartTime] = useState("")
  const [requestDuration, setRequestDuration] = useState(60)
  const [requestTopic, setRequestTopic] = useState("")
  const [requestDescription, setRequestDescription] = useState("")
  const [requestError, setRequestError] = useState("")
  const [requestSubmitting, setRequestSubmitting] = useState(false)

  const [, , , getAvailability] = useServerAction(GetMentorAvailabilityAction)
  const [, , , updateAvailability] = useServerAction(UpdateAvailabilityAction)
  const [, , , deleteSessionRequestsForSlot] = useServerAction(
    DeleteSessionRequestsForRemovedSlotAction
  )
  const [, , , getAuthUser] = useServerAction(AuthUserAction)
  const [, , , getViewerRpBalance] = useServerAction(GetUserRewardBalanceAction)
  const [, , , getMyRequests] = useServerAction(
    GetMySessionRequestsForMentorAction
  )
  const [, , , createSessionRequest] = useServerAction(
    CreateSessionRequestAction
  )

  const loadSlots = useCallback(async () => {
    const res = await getAvailability(userId)
    if (res?.success) setSlots((res.data ?? []).filter((s) => s.is_active))
  }, [userId])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const loadMyRequests = useCallback(async () => {
    const res = await getMyRequests(userId)
    if (res?.success) setMyRequests(res.data ?? [])
  }, [userId])

  useEffect(() => {
    if (isMyProfile) return
    const fetchViewerContext = async () => {
      const authUser = await getAuthUser()
      if (!authUser) return
      const balanceRes = await getViewerRpBalance(
        authUser.unique_id,
        REPUTATION_POINTS_REWARD_ID
      )
      if (balanceRes?.success) {
        setViewerRp(balanceRes.data?.current_balance ?? 0)
      }
    }
    fetchViewerContext()
    loadMyRequests()
  }, [isMyProfile, loadMyRequests])

  // ── Navigation ────────────────────────────────────────────────────────────────

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

  // ── Calendar cells ────────────────────────────────────────────────────────────

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

  // ── Slot helpers ──────────────────────────────────────────────────────────────

  const getSlotsForDate = (date: Date) =>
    slots.filter((s) => slotAppliesToDate(s, date))

  // Matches by date + time overlap rather than availability_slot_id — editing
  // availability replaces every slot row with a fresh id, so a stale id match
  // would silently stop showing "Pending" even though the request still exists.
  const myPendingRequestFor = (slot: SelectMentorAvailability, date: Date) => {
    const dateStr = moment(date).format("YYYY-MM-DD")
    const slotStart = toMins(slot.start_time)
    const slotEnd = toMins(slot.end_time)
    return myRequests.find(
      (r) =>
        r.session_date === dateStr &&
        r.status === "pending" &&
        toMins(r.start_time) < slotEnd &&
        slotStart < toMins(r.end_time)
    )
  }

  const resetPopupForm = (date: Date) => {
    setPendingDeleteId(null)
    setRequestFormSlot(null)
    setRequestError("")
    const dateStr = moment(date).format("YYYY-MM-DD")
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

    // Overlap check — slots conflict if they share a day, overlapping times, AND overlapping date ranges
    const timesOverlap = (s: SelectMentorAvailability) =>
      toMins(newStart) < toMins(s.end_time) &&
      toMins(s.start_time) < toMins(newEnd)

    const dayOverlaps = (s: SelectMentorAvailability, dow: number) => {
      const sDow = moment(s.date, "YYYY-MM-DD").day()
      if (s.repeat_type === "daily") return true
      if (s.repeat_type === "none") {
        if (newRepeat === "none") return s.date === newDate
        if (newRepeat === "daily") return true
        if (newRepeat === "weekly") return sDow === dow
      }
      if (s.repeat_type === "weekly") {
        if (newRepeat === "none")
          return sDow === moment(newDate, "YYYY-MM-DD").day()
        if (newRepeat === "daily") return true
        if (newRepeat === "weekly") return sDow === dow
      }
      return false
    }

    const dateRangesOverlap = (s: SelectMentorAvailability, dow: number) => {
      const existingStart = s.date
      // A one-time slot only occupies its own date — it doesn't repeat, so
      // it must not be treated as extending indefinitely into the future.
      const existingEnd =
        s.repeat_type === "none" ? s.date : (s.repeat_end_date ?? "9999-12-31")
      const newFirst =
        newRepeat === "weekly" ? nextOccurrence(newDate, dow) : newDate
      const newLast =
        newRepeat !== "none" ? newRepeatEnd || endOfMonth(newDate) : newDate
      return newFirst <= existingEnd && existingStart <= newLast
    }

    const hasConflict = (dow: number) =>
      slots.some(
        (s) =>
          dayOverlaps(s, dow) && timesOverlap(s) && dateRangesOverlap(s, dow)
      )

    if (newRepeat === "weekly") {
      const conflicting = newRepeatDays
        .filter((dow) => hasConflict(dow))
        .map((dow) => DAY_HEADERS[dow])
      if (conflicting.length > 0) {
        setSlotError(`Overlapping slot exists for: ${conflicting.join(", ")}`)
        return
      }
    } else {
      if (hasConflict(moment(newDate, "YYYY-MM-DD").day())) {
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

  const openRequestForm = (slot: SelectMentorAvailability) => {
    setRequestFormSlot(slot)
    setRequestTopic("")
    setRequestDescription("")
    setRequestError("")
    setRequestStartTime(slot.start_time)
    const fitting = getDurationOptions(slot, slot.start_time)
    setRequestDuration(fitting[0] ?? 60)
  }

  const handleRequestStartTimeChange = (value: string) => {
    setRequestStartTime(value)
    if (!requestFormSlot) return
    const fitting = getDurationOptions(requestFormSlot, value)
    if (!fitting.includes(requestDuration)) {
      setRequestDuration(fitting[0] ?? 60)
    }
  }

  const handleSubmitRequest = async () => {
    if (!requestFormSlot || !selectedDate) return
    if (!requestTopic.trim()) {
      setRequestError("Topic is required")
      return
    }

    setRequestSubmitting(true)
    const res = await createSessionRequest({
      mentorId: userId,
      availabilitySlotId: requestFormSlot.id,
      sessionDate: moment(selectedDate).format("YYYY-MM-DD"),
      startTime: requestStartTime,
      endTime: minsToTime(toMins(requestStartTime) + requestDuration),
      topic: requestTopic,
      description: requestDescription
    })
    setRequestSubmitting(false)

    if (res?.success) {
      await loadMyRequests()
      setRequestFormSlot(null)
      toast({ title: "Session request sent", duration: 2000 })
    } else {
      setRequestError(res?.error ?? "Failed to send request")
    }
  }

  const serializeSlots = (list: SelectMentorAvailability[]) =>
    list.map((s) => ({
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      session_type: s.session_type,
      repeat_type: s.repeat_type,
      repeat_end_date: s.repeat_end_date ?? null
    }))

  /** Remove the entire recurring series (or a one-time slot). */
  const handleDeleteSeries = async (slotId: number) => {
    setPendingDeleteId(null)
    setSlotError("")
    const slot = slots.find((s) => s.id === slotId)
    const remaining = serializeSlots(slots.filter((s) => s.id !== slotId))
    const res = await updateAvailability({ mentorId: userId, slots: remaining })
    if (res?.success) {
      if (slot) {
        await deleteSessionRequestsForSlot({
          mentorId: userId,
          startTime: slot.start_time,
          endTime: slot.end_time
        })
      }
      setSlots([])
      await loadSlots()
      if (selectedDate) resetPopupForm(selectedDate)
      toast({ title: "Slot removed", duration: 2000 })
    }
  }

  /** Remove only the occurrence on `date`, keeping the rest of the series intact. */
  const handleDeleteOccurrence = async (slotId: number, date: Date) => {
    setPendingDeleteId(null)
    setSlotError("")
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return

    const dow = moment(slot.date, "YYYY-MM-DD").day()
    const occStr = moment(date).format("YYYY-MM-DD")

    // Day before this occurrence → previous series ends here
    const prevStr = moment(date).subtract(1, "day").format("YYYY-MM-DD")

    // Day after this occurrence → next series starts here
    const afterStr = moment(date).add(1, "day").format("YYYY-MM-DD")
    const nextStr =
      slot.repeat_type === "daily" ? afterStr : nextOccurrence(afterStr, dow)

    const otherSlots = serializeSlots(slots.filter((s) => s.id !== slotId))
    const additions: typeof otherSlots = []

    // Keep everything BEFORE this occurrence (only if anchor < occurrence)
    if (slot.date < occStr) {
      additions.push({
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        session_type: slot.session_type,
        repeat_type: slot.repeat_type,
        repeat_end_date: prevStr
      })
    }

    // Keep everything AFTER this occurrence (only if a next occurrence exists within the original end)
    const originalEnd = slot.repeat_end_date ?? null
    if (!originalEnd || nextStr <= originalEnd) {
      additions.push({
        date: nextStr,
        start_time: slot.start_time,
        end_time: slot.end_time,
        session_type: slot.session_type,
        repeat_type: slot.repeat_type,
        repeat_end_date: originalEnd
      })
    }

    const res = await updateAvailability({
      mentorId: userId,
      slots: [...otherSlots, ...additions]
    })
    if (res?.success) {
      await deleteSessionRequestsForSlot({
        mentorId: userId,
        startTime: slot.start_time,
        endTime: slot.end_time,
        sessionDate: occStr
      })
      setSlots([])
      await loadSlots()
      if (selectedDate) resetPopupForm(selectedDate)
      toast({ title: "Occurrence removed", duration: 2000 })
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
        {daySlots.slice(0, 2).map((slot) => {
          const pending = !isMyProfile && myPendingRequestFor(slot, date)
          return (
            <div
              key={slot.id}
              title={
                pending
                  ? `Pending request · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                  : `${slot.session_type === "group" ? "Group" : "1-on-1"} · ${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
              }
              className={cn(
                "text-[10px] leading-tight truncate rounded px-1 py-0.5 font-medium flex items-center gap-0.5",
                pending
                  ? "bg-amber-500/20 text-amber-600"
                  : "bg-primary/20 text-primary"
              )}
            >
              {pending ? (
                <Clock className="h-2.5 w-2.5 shrink-0" />
              ) : slot.session_type === "group" ? (
                <Users className="h-2.5 w-2.5 shrink-0" />
              ) : (
                <Video className="h-2.5 w-2.5 shrink-0" />
              )}
              {pending ? "Pending" : formatTime(slot.start_time)}
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
              {requestFormSlot
                ? "Request a Session"
                : isMyProfile
                  ? "New Availability Slot"
                  : `${selectedDayName} Availability`}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
            {requestFormSlot ? (
              <>
                {/* Session Type (inherited from the slot, not editable) */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Session Type
                  </Label>
                  <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-foreground/10 bg-muted/40">
                    {requestFormSlot.session_type === "group" ? (
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Video className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {requestFormSlot.session_type === "group"
                      ? "Group"
                      : "1-on-1"}
                    <span className="text-muted-foreground ml-auto">
                      Open {formatTime(requestFormSlot.start_time)} –{" "}
                      {formatTime(requestFormSlot.end_time)}
                    </span>
                  </div>
                </div>

                {/* Start Time / Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Start Time
                    </Label>
                    <Select
                      value={requestStartTime}
                      onValueChange={handleRequestStartTimeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getStartTimeOptions(requestFormSlot).map((t) => (
                          <SelectItem key={t} value={t}>
                            {formatTime(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Duration
                    </Label>
                    <Select
                      value={String(requestDuration)}
                      onValueChange={(v) => setRequestDuration(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getDurationOptions(
                          requestFormSlot,
                          requestStartTime
                        ).map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {formatDuration(d)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  Your session: {formatTime(requestStartTime)} –{" "}
                  {formatTime(
                    minsToTime(toMins(requestStartTime) + requestDuration)
                  )}
                </p>

                {/* Topic */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Topic
                  </Label>
                  <Input
                    value={requestTopic}
                    placeholder="What do you want to discuss?"
                    onChange={(e) => {
                      setRequestTopic(e.target.value)
                      setRequestError("")
                    }}
                    className={cn(requestError && "border-destructive")}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Description <span className="opacity-60">(optional)</span>
                  </Label>
                  <Textarea
                    value={requestDescription}
                    placeholder="Add context, background, or specific questions"
                    onChange={(e) => setRequestDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {requestError && (
                  <p className="text-destructive text-xs">{requestError}</p>
                )}
              </>
            ) : (
              <>
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
                              onClick={() => {
                                setNewRepeat(r)
                                setSlotError("")
                              }}
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
                          className="rounded-lg border border-foreground/8 text-sm overflow-hidden"
                        >
                          {/* Slot info row */}
                          <div className="flex items-center justify-between px-3 py-2.5">
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
                                {slot.session_type === "group"
                                  ? "Group"
                                  : "1-on-1"}
                              </span>
                            </div>
                            {isMyProfile && (
                              <button
                                onClick={() => {
                                  if (slot.repeat_type === "none") {
                                    handleDeleteSeries(slot.id)
                                  } else {
                                    setPendingDeleteId(
                                      pendingDeleteId === slot.id
                                        ? null
                                        : slot.id
                                    )
                                  }
                                }}
                                className="h-6 w-6 flex items-center justify-center shrink-0 rounded text-destructive hover:bg-destructive/10 transition-colors ml-2"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Request action — viewer only */}
                          {!isMyProfile &&
                            (myPendingRequestFor(slot, selectedDate!) ? (
                              <div className="flex items-center gap-1.5 px-3 py-2 border-t border-foreground/8 text-xs text-amber-600 font-medium">
                                <Clock className="h-3 w-3" />
                                Request pending
                              </div>
                            ) : viewerRp < RP_THRESHOLD ? (
                              <div className="px-3 py-2 border-t border-foreground/8">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="w-full inline-block">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled
                                          className="w-full pointer-events-none opacity-50"
                                        >
                                          Request this Slot
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        Earn {RP_THRESHOLD - viewerRp} more RP
                                        to request a session
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ) : (
                              <div className="px-3 py-2 border-t border-foreground/8">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => openRequestForm(slot)}
                                >
                                  Request this Slot
                                </Button>
                              </div>
                            ))}

                          {/* Inline delete confirmation — only for recurring slots */}
                          {isMyProfile && pendingDeleteId === slot.id && (
                            <div className="flex items-center gap-2 px-3 py-2 border-t border-foreground/8 bg-destructive/5">
                              <p className="text-xs text-muted-foreground flex-1">
                                Remove:
                              </p>
                              <button
                                onClick={() =>
                                  handleDeleteOccurrence(slot.id, selectedDate!)
                                }
                                className="text-xs px-2 py-1 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap"
                              >
                                This date
                              </button>
                              <button
                                onClick={() => handleDeleteSeries(slot.id)}
                                className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors whitespace-nowrap"
                              >
                                All dates
                              </button>
                              <button
                                onClick={() => setPendingDeleteId(null)}
                                className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
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
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-foreground/8 shrink-0">
            <button
              onClick={() =>
                requestFormSlot
                  ? setRequestFormSlot(null)
                  : setIsPopupOpen(false)
              }
              className="px-4 py-2 text-sm font-medium hover:text-foreground text-muted-foreground transition-colors"
            >
              {requestFormSlot ? "Back" : isMyProfile ? "Cancel" : "Close"}
            </button>
            {isMyProfile && !requestFormSlot && (
              <Button
                onClick={handleAddSlot}
                loading={saving}
                className="h-9 px-5 text-sm rounded-lg"
              >
                Add Slot
              </Button>
            )}
            {requestFormSlot && (
              <Button
                onClick={handleSubmitRequest}
                loading={requestSubmitting}
                className="h-9 px-5 text-sm rounded-lg"
              >
                Send Request
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
