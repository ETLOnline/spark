"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"
import { Sparkles, Users, Video } from "lucide-react"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSessionRequestAction,
  DeleteSessionRequestsForRemovedSlotAction,
  GetAcceptedSessionRequestsForMentorAction,
  GetMentorAvailabilityAction,
  GetMySessionRequestsForMentorAction,
  GetPendingSessionRequestsForMentorAction,
  ResubmitSessionRequestAction,
  UpdateAvailabilityAction
} from "@/src/server-actions/Mentor/MentorActions"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { GetUserRewardBalanceAction } from "@/src/server-actions/Reward/Reward"
import { toast } from "@/src/hooks/use-toast"
import { SelectMentorAvailability, SelectSessionRequest } from "@/src/db/schema"
import moment from "moment-timezone"
import {
  DAY_HEADERS,
  DAYS,
  REPUTATION_POINTS_REWARD_ID
} from "@/src/utils/constants"
import { MIN_DURATION_MINS, toMins } from "@/src/utils/time"
import {
  endOfMonth,
  formatDuration,
  formatTime,
  getDurationOptions,
  getSlotsForDate,
  getStartTimeOptions,
  getUnavailableRangesForRequest,
  isPastDate,
  minsToTime,
  nextOccurrence,
  RepeatType,
  SessionType
} from "./mentor-calendar/mentorCalendarUtils"
import { MentorCalendarGrid } from "./mentor-calendar/MentorCalendarGrid"
import { SlotListItem } from "./mentor-calendar/SlotListItem"
import { SessionRequestForm } from "./mentor-calendar/SessionRequestForm"
import { AvailabilitySlotForm } from "./mentor-calendar/AvailabilitySlotForm"

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

  const [acceptedRequests, setAcceptedRequests] = useState<
    SelectSessionRequest[]
  >([])
  const [mentorPendingRequests, setMentorPendingRequests] = useState<
    SelectSessionRequest[]
  >([])

  const [, , , getAvailability] = useServerAction(GetMentorAvailabilityAction)
  const [, , , updateAvailability] = useServerAction(UpdateAvailabilityAction)
  const [, , , getAuthUser] = useServerAction(AuthUserAction)
  const [, , , getViewerRpBalance] = useServerAction(GetUserRewardBalanceAction)
  const [, , , getMyRequests] = useServerAction(
    GetMySessionRequestsForMentorAction
  )
  const [, , , createSessionRequest] = useServerAction(
    CreateSessionRequestAction
  )
  const [resubmitSubmitting, , , resubmitSessionRequest] = useServerAction(
    ResubmitSessionRequestAction
  )
  const [, , , getAcceptedRequests] = useServerAction(
    GetAcceptedSessionRequestsForMentorAction
  )
  const [, , , getMentorPendingRequests] = useServerAction(
    GetPendingSessionRequestsForMentorAction
  )
  const [, , , deleteSessionRequestsForSlot] = useServerAction(
    DeleteSessionRequestsForRemovedSlotAction
  )

  // Resubmit state — mentee picks a suggested slot
  const [resubmitFormSlot, setResubmitFormSlot] =
    useState<SelectMentorAvailability | null>(null)
  const [resubmitOriginalRequestId, setResubmitOriginalRequestId] = useState<
    number | null
  >(null)
  const [resubmitError, setResubmitError] = useState("")

  // Set of occurrence keys ("slotId-YYYY-MM-DD") from all slot_suggested requests.
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

  /** Returns the slot_suggested request for this exact slot + date occurrence, if any. */
  const getSuggestedRequestForSlot = (slotId: number, date: Date) => {
    const key = `${slotId}-${moment(date).format("YYYY-MM-DD")}`
    return (
      myRequests.find(
        (r) =>
          r.status === "slot_suggested" &&
          ((r.suggested_slot_ids ?? []) as unknown as string[]).includes(key)
      ) ?? null
    )
  }

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

  const loadAcceptedRequests = useCallback(async () => {
    const res = await getAcceptedRequests(userId)
    if (res?.success)
      setAcceptedRequests((res.data as SelectSessionRequest[]) ?? [])
  }, [userId])

  const loadMentorPendingRequests = useCallback(async () => {
    const res = await getMentorPendingRequests(userId)
    if (res?.success)
      setMentorPendingRequests((res.data as SelectSessionRequest[]) ?? [])
  }, [userId])

  useEffect(() => {
    loadAcceptedRequests()
    if (isMyProfile) {
      loadMentorPendingRequests()
      return
    }
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
  }, [
    isMyProfile,
    loadMyRequests,
    loadAcceptedRequests,
    loadMentorPendingRequests
  ])

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
    if (
      !isMyProfile &&
      (getSlotsForDate(slots, date).length === 0 || isPastDate(date))
    )
      return
    setSelectedDate(date)
    resetPopupForm(date)
    setIsPopupOpen(true)
  }

  const handleAddSlot = async () => {
    const anchorStart = moment(`${newDate} ${newStart}`, "YYYY-MM-DD HH:mm")
    if (anchorStart.isBefore(moment())) {
      setSlotError("Cannot add availability in the past")
      return
    }
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
    const unavailable = selectedDate
      ? getUnavailableRangesForRequest(
          slot,
          selectedDate,
          myRequests,
          acceptedRequests
        )
      : []
    const startOptions = getStartTimeOptions(slot, unavailable)
    const firstStart = startOptions[0] ?? slot.start_time
    setRequestStartTime(firstStart)
    const fitting = getDurationOptions(slot, firstStart, unavailable)
    setRequestDuration(fitting[0] ?? 60)
  }

  const openResubmitForm = (
    slot: SelectMentorAvailability,
    originalRequestId: number
  ) => {
    setResubmitFormSlot(slot)
    setResubmitOriginalRequestId(originalRequestId)
    setResubmitError("")
    setRequestStartTime(slot.start_time)
    const fitting = getDurationOptions(slot, slot.start_time, [])
    setRequestDuration(fitting[0] ?? 60)
  }

  const confirmSuggestedSlot = async () => {
    if (!resubmitFormSlot || !selectedDate || !resubmitOriginalRequestId) return
    const endTime = minsToTime(toMins(requestStartTime) + requestDuration)
    const res = await resubmitSessionRequest({
      requestId: resubmitOriginalRequestId,
      slotId: resubmitFormSlot.id,
      sessionDate: moment(selectedDate).format("YYYY-MM-DD"),
      startTime: requestStartTime,
      endTime
    })
    if (res?.success) {
      await loadMyRequests()
      setResubmitFormSlot(null)
      setResubmitOriginalRequestId(null)
      toast({ title: "Session request resubmitted", duration: 2000 })
    } else {
      setResubmitError(res?.error ?? "Failed to resubmit")
    }
  }

  const handleRequestStartTimeChange = (value: string) => {
    setRequestStartTime(value)
    if (!requestFormSlot || !selectedDate) return
    const unavailable = getUnavailableRangesForRequest(
      requestFormSlot,
      selectedDate,
      myRequests,
      acceptedRequests
    )
    const fitting = getDurationOptions(requestFormSlot, value, unavailable)
    if (!fitting.includes(requestDuration)) {
      setRequestDuration(fitting[0] ?? 60)
    }
  }

  const handleResubmitStartTimeChange = (value: string) => {
    setRequestStartTime(value)
    if (!resubmitFormSlot) return
    const fitting = getDurationOptions(resubmitFormSlot, value, [])
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

  const slotsForSelected = selectedDate
    ? getSlotsForDate(slots, selectedDate)
    : []
  const selectedDayName = selectedDate ? DAYS[selectedDate.getDay()] : ""

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <MentorCalendarGrid
        today={today}
        slots={slots}
        isMyProfile={isMyProfile}
        myRequests={myRequests}
        bookedRequests={acceptedRequests}
        mentorPendingRequests={mentorPendingRequests}
        mentorAcceptedRequests={acceptedRequests}
        onSelectDate={openPopup}
        onNewSlotClick={() => {
          setSelectedDate(today)
          resetPopupForm(today)
          setIsPopupOpen(true)
        }}
      />

      {/* ── Popup ── */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 flex flex-col max-h-[90dvh]">
          <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
            <DialogTitle className="text-lg font-semibold">
              {resubmitFormSlot
                ? "Suggested Slot"
                : requestFormSlot
                  ? "Request a Session"
                  : isMyProfile
                    ? "New Availability Slot"
                    : `${selectedDayName} Availability`}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
            {resubmitFormSlot ? (
              <>
                {/* Resubmit — time picker for the selected suggested slot */}
                <p className="text-xs text-purple-500 font-medium flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Suggested slot — pick your preferred time
                </p>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Session Type
                  </Label>
                  <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-foreground/10 bg-muted/40">
                    {resubmitFormSlot.session_type === "group" ? (
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Video className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {resubmitFormSlot.session_type === "group"
                      ? "Group"
                      : "1-on-1"}
                    <span className="text-muted-foreground ml-auto">
                      Open {formatTime(resubmitFormSlot.start_time)} –{" "}
                      {formatTime(resubmitFormSlot.end_time)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Start Time
                    </Label>
                    <Select
                      value={requestStartTime}
                      onValueChange={handleResubmitStartTimeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getStartTimeOptions(resubmitFormSlot, []).map((t) => (
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
                          resubmitFormSlot,
                          requestStartTime,
                          []
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
                {resubmitError && (
                  <p className="text-destructive text-xs">{resubmitError}</p>
                )}
              </>
            ) : requestFormSlot ? (
              <SessionRequestForm
                slot={requestFormSlot}
                unavailableRanges={
                  selectedDate
                    ? getUnavailableRangesForRequest(
                        requestFormSlot,
                        selectedDate,
                        myRequests,
                        acceptedRequests
                      )
                    : []
                }
                startTime={requestStartTime}
                onStartTimeChange={handleRequestStartTimeChange}
                duration={requestDuration}
                onDurationChange={setRequestDuration}
                topic={requestTopic}
                onTopicChange={(v) => {
                  setRequestTopic(v)
                  setRequestError("")
                }}
                description={requestDescription}
                onDescriptionChange={setRequestDescription}
                error={requestError}
              />
            ) : (
              <>
                {isMyProfile && (
                  <AvailabilitySlotForm
                    today={today}
                    newDate={newDate}
                    onDateChange={setNewDate}
                    newStart={newStart}
                    onStartChange={setNewStart}
                    newEnd={newEnd}
                    onEndChange={setNewEnd}
                    newSession={newSession}
                    onSessionChange={setNewSession}
                    newRepeat={newRepeat}
                    onRepeatChange={setNewRepeat}
                    newRepeatDays={newRepeatDays}
                    onRepeatDaysChange={setNewRepeatDays}
                    newRepeatEnd={newRepeatEnd}
                    onRepeatEndChange={setNewRepeatEnd}
                    slotError={slotError}
                    onClearSlotError={() => setSlotError("")}
                  />
                )}

                {/* Slot list */}
                {slotsForSelected.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {isMyProfile
                        ? "Existing Slots"
                        : selectedDate &&
                            slotsForSelected.some((s) =>
                              suggestedOccurrenceKeys.has(
                                `${s.id}-${moment(selectedDate).format("YYYY-MM-DD")}`
                              )
                            )
                          ? "Suggested Slots"
                          : "Available Times"}
                      {slotsForSelected.length > 2 && (
                        <span className="ml-1.5 normal-case font-normal opacity-60">
                          ({slotsForSelected.length})
                        </span>
                      )}
                    </p>
                    <div className="space-y-1.5 max-h-[152px] overflow-y-auto pr-0.5">
                      {slotsForSelected.map((slot) => (
                        <SlotListItem
                          key={slot.id}
                          slot={slot}
                          isMyProfile={isMyProfile}
                          selectedDate={selectedDate!}
                          myRequests={myRequests}
                          bookedRequests={acceptedRequests}
                          mentorPendingRequests={mentorPendingRequests}
                          mentorAcceptedRequests={acceptedRequests}
                          viewerRp={viewerRp}
                          pendingDeleteId={pendingDeleteId}
                          onTogglePendingDelete={setPendingDeleteId}
                          onDeleteSeries={handleDeleteSeries}
                          onDeleteOccurrence={handleDeleteOccurrence}
                          onRequestSlot={openRequestForm}
                          suggestedRequest={getSuggestedRequestForSlot(
                            slot.id,
                            selectedDate!
                          )}
                          onConfirmSuggestedSlot={(s, requestId) =>
                            openResubmitForm(s, requestId)
                          }
                        />
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
              onClick={() => {
                if (resubmitFormSlot) {
                  setResubmitFormSlot(null)
                  setResubmitOriginalRequestId(null)
                  setResubmitError("")
                } else if (requestFormSlot) {
                  setRequestFormSlot(null)
                } else {
                  setIsPopupOpen(false)
                }
              }}
              className="px-4 py-2 text-sm font-medium hover:text-foreground text-muted-foreground transition-colors"
            >
              {resubmitFormSlot || requestFormSlot
                ? "Back"
                : isMyProfile
                  ? "Cancel"
                  : "Close"}
            </button>
            {isMyProfile && !requestFormSlot && !resubmitFormSlot && (
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
            {resubmitFormSlot && (
              <Button
                onClick={confirmSuggestedSlot}
                loading={resubmitSubmitting}
                className="h-9 px-5 text-sm rounded-lg"
              >
                Confirm Selection
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
