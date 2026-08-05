import moment from "moment-timezone"
import { SelectMentorAvailability, SelectSessionRequest } from "@/src/db/schema"
import { DAYS } from "@/src/utils/constants"
import { MIN_DURATION_MINS, recurrencesOverlap, toMins } from "@/src/utils/time"
import { cn } from "@/src/lib/utils"

/** True if a session request's own recurrence (one-time/daily/weekly) includes `dateStr`. */
function requestAppliesToDate(r: SelectSessionRequest, dateStr: string) {
  return recurrencesOverlap(
    {
      date: r.session_date,
      repeat_type: r.repeat_type,
      repeat_end_date: r.repeat_end_date
    },
    { date: dateStr, repeat_type: "none" }
  )
}

export type ViewType = "month" | "week"
export type RepeatType = "none" | "daily" | "weekly"
export type SessionType = "1:1" | "group"
export type TimeRange = { start: number; end: number }

/** Format a HH:mm string to 12-hour display. */
export function formatTime(time: string) {
  return moment(time, "HH:mm").format("h:mm A")
}

export function minsToTime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`
  const hours = mins / 60
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hr`
}

/** Start times a mentee can pick, stepped every MIN_DURATION_MINS — excludes any step that overlaps an already-booked range. */
export function getStartTimeOptions(
  slot: SelectMentorAvailability,
  bookedRanges: TimeRange[] = []
) {
  const options: string[] = []
  const startMin = toMins(slot.start_time)
  const endMin = toMins(slot.end_time)
  for (
    let t = startMin;
    t <= endMin - MIN_DURATION_MINS;
    t += MIN_DURATION_MINS
  ) {
    const overlapsBooked = bookedRanges.some(
      (b) => t < b.end && b.start < t + MIN_DURATION_MINS
    )
    if (!overlapsBooked) options.push(minsToTime(t))
  }
  return options
}

/** Durations that fit between `startTime` and the slot's end (or the next booked range, whichever comes first), in MIN_DURATION_MINS steps. */
export function getDurationOptions(
  slot: SelectMentorAvailability,
  startTime: string,
  bookedRanges: TimeRange[] = []
) {
  const start = toMins(startTime)
  let cappedEnd = toMins(slot.end_time)
  for (const b of bookedRanges) {
    if (b.start >= start && b.start < cappedEnd) cappedEnd = b.start
  }
  const remaining = cappedEnd - start
  const options: number[] = []
  for (let d = MIN_DURATION_MINS; d <= remaining; d += MIN_DURATION_MINS) {
    options.push(d)
  }
  return options
}

/** Returns true if this slot should appear on `date`. */
export function slotAppliesToDate(
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

export function getSlotsForDate(slots: SelectMentorAvailability[], date: Date) {
  return slots.filter((s) => slotAppliesToDate(s, date))
}

/** True if `date` is strictly before today (date-level, ignoring time-of-day). */
export function isPastDate(date: Date): boolean {
  return moment(date).startOf("day").isBefore(moment().startOf("day"))
}

/** Minutes-of-day before which a mentee can no longer pick a start time on `date` — 0 for any future date, "right now" for today. */
export function minAllowedStartMinsFor(date: Date): number {
  if (!moment(date).isSame(moment(), "day")) return 0
  return moment().hours() * 60 + moment().minutes()
}

export function repeatLabel(slot: SelectMentorAvailability) {
  if (slot.repeat_type === "weekly")
    return `Every ${DAYS[moment(slot.date, "YYYY-MM-DD").day()]}`
  if (slot.repeat_type === "daily") return "Every day"
  return "One-time"
}

/** Last day of the month containing `dateStr`. */
export function endOfMonth(dateStr: string): string {
  return moment(dateStr, "YYYY-MM-DD").endOf("month").format("YYYY-MM-DD")
}

/** First occurrence of `targetDow` (0=Sun) on or after `fromDateStr`. */
export function nextOccurrence(fromDateStr: string, targetDow: number): string {
  const m = moment(fromDateStr, "YYYY-MM-DD")
  const diff = (targetDow - m.day() + 7) % 7
  return m.clone().add(diff, "days").format("YYYY-MM-DD")
}

/** Every valid "repeat until" date for a recurring request against `slot` —
 * every occurrence of the slot's own cadence from `anchorDateStr` through
 * its repeat_end_date (or a 1-year cap if the slot itself is open-ended).
 * Used to restrict the "Repeat until" picker to dates that actually exist
 * for this slot, since a plain date input can't disable arbitrary days. */
export function getRepeatUntilOptions(
  slot: SelectMentorAvailability,
  anchorDateStr: string
): string[] {
  if (slot.repeat_type === "none") return []
  const stepDays = slot.repeat_type === "daily" ? 1 : 7
  const end = slot.repeat_end_date
    ? moment(slot.repeat_end_date, "YYYY-MM-DD")
    : moment(anchorDateStr, "YYYY-MM-DD").add(1, "year")

  const options: string[] = []
  let cursor = moment(anchorDateStr, "YYYY-MM-DD")
  while (!cursor.isAfter(end)) {
    options.push(cursor.format("YYYY-MM-DD"))
    cursor = cursor.clone().add(stepDays, "days")
  }
  return options
}

/** Reusable pill/segment toggle class helper — shared by the view toggle and the repeat toggle. */
export function toggleItemCls(
  active: boolean,
  first: boolean,
  extraPad = "px-3 py-1.5"
) {
  return cn(
    extraPad,
    "text-xs font-medium transition-colors",
    !first && "border-l border-foreground/10",
    active
      ? "bg-primary text-primary-foreground"
      : "hover:bg-muted text-muted-foreground"
  )
}

// ── Request/booking overlap helpers ─────────────────────────────────────────────
// All matched by date + time overlap rather than availability_slot_id — editing
// availability replaces every slot row with a fresh id, so a stale id match
// would silently stop showing "Pending"/"Booked" even though the request exists.

/** The viewer's own pending or resubmitted request overlapping this slot's window on this date. */
export function myPendingRequestFor(
  slot: SelectMentorAvailability,
  date: Date,
  myRequests: SelectSessionRequest[]
) {
  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  return myRequests.find(
    (r) =>
      requestAppliesToDate(r, dateStr) &&
      (r.status === "pending" || r.status === "resubmitted") &&
      toMins(r.start_time) < slotEnd &&
      slotStart < toMins(r.end_time)
  )
}

/** The viewer's own slot_suggested request on the original date — shown as "Rescheduled". */
export function myRescheduledRequestFor(
  slot: SelectMentorAvailability,
  date: Date,
  myRequests: SelectSessionRequest[]
) {
  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  return myRequests.find(
    (r) =>
      r.session_date === dateStr &&
      r.status === "slot_suggested" &&
      toMins(r.start_time) < slotEnd &&
      slotStart < toMins(r.end_time)
  )
}

/** Human-readable dates from a slot_suggested request's suggested_slot_ids
 * ("slotId-YYYY-MM-DD" occurrence keys) — e.g. "Aug 7, 2026" or "Aug 7 or Aug 14, 2026". */
export function formatSuggestedSlotDates(request: SelectSessionRequest) {
  const keys = (request.suggested_slot_ids ?? []) as unknown as string[]
  const dates = Array.from(new Set(keys.map((key) => key.slice(-10)))).sort()
  return dates
    .map((d) => moment(d, "YYYY-MM-DD").format("MMM D, YYYY"))
    .join(" or ")
}

/** The viewer's own rejected request overlapping this slot's window on this date. */
export function myRejectedRequestFor(
  slot: SelectMentorAvailability,
  date: Date,
  myRequests: SelectSessionRequest[]
) {
  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  return myRequests.find(
    (r) =>
      requestAppliesToDate(r, dateStr) &&
      r.status === "rejected" &&
      toMins(r.start_time) < slotEnd &&
      slotStart < toMins(r.end_time)
  )
}

/** Every accepted booking THIS mentee has within the slot's window on this
 * date — a mentee can hold more than one confirmed hour in a longer slot. */
export function myAcceptedRequestsFor(
  slot: SelectMentorAvailability,
  date: Date,
  myRequests: SelectSessionRequest[]
) {
  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  return myRequests.filter(
    (r) =>
      requestAppliesToDate(r, dateStr) &&
      r.status === "accepted" &&
      toMins(r.start_time) < slotEnd &&
      slotStart < toMins(r.end_time)
  )
}

/** Accepted bookings by OTHER mentees within this slot's window — shown so
 * a viewer can see which specific hours are already taken, not just a
 * blanket "Booked" once every hour is gone. */
export function othersBookedRequestsFor(
  slot: SelectMentorAvailability,
  date: Date,
  myRequests: SelectSessionRequest[],
  bookedRequests: SelectSessionRequest[]
) {
  // Group slots hold many mentees at once — another mentee's accepted hour
  // isn't "taken" the way it would be in a 1:1 slot, so nothing to show here.
  if (slot.session_type === "group") return []

  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  const myAcceptedIds = new Set(
    myRequests.filter((r) => r.status === "accepted").map((r) => r.id)
  )
  return bookedRequests.filter(
    (r) =>
      requestAppliesToDate(r, dateStr) &&
      !myAcceptedIds.has(r.id) &&
      toMins(r.start_time) < slotEnd &&
      slotStart < toMins(r.end_time)
  )
}

export function getBookedRangesForSlot(
  slot: SelectMentorAvailability,
  date: Date,
  bookedRequests: SelectSessionRequest[]
): TimeRange[] {
  // Group slots can hold many mentees at once — another mentee's accepted
  // booking shouldn't block the window for anyone else. Only 1:1 slots have
  // a single occupant, so only they treat an accepted booking as "taken."
  if (slot.session_type === "group") return []

  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  return bookedRequests
    .filter(
      (r) =>
        requestAppliesToDate(r, dateStr) &&
        toMins(r.start_time) < slotEnd &&
        slotStart < toMins(r.end_time)
    )
    .map((r) => ({ start: toMins(r.start_time), end: toMins(r.end_time) }))
}

/** How many requests (of any mentee) overlap this slot's window on this date —
 * used on the mentor's own calendar so they can see activity at a glance. */
export function countOverlappingRequests(
  slot: SelectMentorAvailability,
  date: Date,
  requests: SelectSessionRequest[]
) {
  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  return requests.filter(
    (r) =>
      requestAppliesToDate(r, dateStr) &&
      toMins(r.start_time) < slotEnd &&
      slotStart < toMins(r.end_time)
  ).length
}

/** Actual "pending"-status requests (not "resubmitted") overlapping this
 * slot's window on this date — used to gate deletion, since only a plain
 * pending request can be routed through the suggest-new-slot action. */
export function pendingOnlyRequestsFor<T extends SelectSessionRequest>(
  slot: SelectMentorAvailability,
  date: Date,
  requests: T[]
): T[] {
  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  return requests.filter(
    (r) =>
      r.status === "pending" &&
      requestAppliesToDate(r, dateStr) &&
      toMins(r.start_time) < slotEnd &&
      slotStart < toMins(r.end_time)
  )
}

/** A slot only counts as "fully booked" once every hour in it is taken — a
 * single accepted hour inside a longer window shouldn't block the rest of it. */
export function isSlotFullyBooked(
  slot: SelectMentorAvailability,
  date: Date,
  bookedRequests: SelectSessionRequest[]
) {
  const bookedRanges = getBookedRangesForSlot(slot, date, bookedRequests)
  if (bookedRanges.length === 0) return false
  return getStartTimeOptions(slot, bookedRanges).length === 0
}

/** What THIS mentee can no longer pick when starting a new request: hours
 * already accepted for anyone, hours they themselves already have a pending
 * request against (other mentees' pending requests don't block — several
 * people can still request the same open hour until the mentor decides),
 * and — for today only — any hour that has already passed. */
export function getUnavailableRangesForRequest(
  slot: SelectMentorAvailability,
  date: Date,
  myRequests: SelectSessionRequest[],
  bookedRequests: SelectSessionRequest[]
): TimeRange[] {
  const dateStr = moment(date).format("YYYY-MM-DD")
  const slotStart = toMins(slot.start_time)
  const slotEnd = toMins(slot.end_time)
  const overlapsSlot = (startTime: string, endTime: string) =>
    toMins(startTime) < slotEnd && slotStart < toMins(endTime)

  const myPendingRanges = myRequests
    .filter(
      (r) =>
        r.status === "pending" &&
        requestAppliesToDate(r, dateStr) &&
        overlapsSlot(r.start_time, r.end_time)
    )
    .map((r) => ({ start: toMins(r.start_time), end: toMins(r.end_time) }))

  const elapsedToday = minAllowedStartMinsFor(date)
  const pastRanges: TimeRange[] =
    elapsedToday > 0 ? [{ start: 0, end: elapsedToday }] : []

  return [
    ...getBookedRangesForSlot(slot, date, bookedRequests),
    ...pastRanges,
    ...myPendingRanges
  ]
}

// ── Session summary (upcoming/past occurrence lookup) ───────────────────────────

/** Days to look ahead/behind for an open-ended (no repeat_end_date) recurring
 * request — bounds an otherwise-unbounded search to a sane window. */
const OPEN_ENDED_SEARCH_DAYS = 730

/** The next start-datetime for this request on/after `now`, or null if the
 * request (or its recurrence) has no more occurrences left. */
function findNextOccurrence(r: SelectSessionRequest, now: moment.Moment) {
  const anchorDt = moment(
    `${r.session_date} ${r.start_time}`,
    "YYYY-MM-DD HH:mm"
  )
  if (r.repeat_type === "none") {
    return anchorDt.isSameOrAfter(now) ? anchorDt : null
  }

  const step = r.repeat_type === "daily" ? 1 : 7
  const end = r.repeat_end_date
    ? moment(r.repeat_end_date, "YYYY-MM-DD")
    : moment(r.session_date, "YYYY-MM-DD").add(OPEN_ENDED_SEARCH_DAYS, "days")

  // Fast-forward close to `now` in whole periods, then step forward one
  // period at a time until we pass `now` (at most one period of iteration).
  let cursor = moment(r.session_date, "YYYY-MM-DD")
  const daysUntilNow = now.clone().startOf("day").diff(cursor, "days")
  if (daysUntilNow > 0) {
    cursor.add(Math.floor(daysUntilNow / step) * step, "days")
  }
  while (!cursor.isAfter(end)) {
    const dt = moment(
      `${cursor.format("YYYY-MM-DD")} ${r.start_time}`,
      "YYYY-MM-DD HH:mm"
    )
    if (dt.isSameOrAfter(now)) return dt
    cursor = cursor.clone().add(step, "days")
  }
  return null
}

/** The most recent start-datetime for this request strictly before `now`,
 * or null if it never occurred before `now`. */
function findLastPastOccurrence(r: SelectSessionRequest, now: moment.Moment) {
  const anchorDt = moment(
    `${r.session_date} ${r.start_time}`,
    "YYYY-MM-DD HH:mm"
  )
  if (r.repeat_type === "none") {
    return anchorDt.isBefore(now) ? anchorDt : null
  }

  const step = r.repeat_type === "daily" ? 1 : 7
  const anchorDate = moment(r.session_date, "YYYY-MM-DD")
  const cap = r.repeat_end_date
    ? moment.min(moment(r.repeat_end_date, "YYYY-MM-DD"), now.clone())
    : now.clone()
  if (cap.isBefore(anchorDate, "day")) return null

  let cursor = anchorDate.clone()
  const daysUntilCap = cap.clone().startOf("day").diff(cursor, "days")
  if (daysUntilCap > 0) {
    cursor.add(Math.floor(daysUntilCap / step) * step, "days")
  }
  let result: moment.Moment | null = null
  while (!cursor.isAfter(cap, "day")) {
    const dt = moment(
      `${cursor.format("YYYY-MM-DD")} ${r.start_time}`,
      "YYYY-MM-DD HH:mm"
    )
    if (dt.isBefore(now)) result = dt
    cursor = cursor.clone().add(step, "days")
  }
  return result
}

export interface SessionOccurrence {
  request: SelectSessionRequest
  occurrence: moment.Moment
}

/** Buckets a set of accepted requests into up to 3 upcoming occurrences —
 * falling back to up to 3 most recent past occurrences when nothing is
 * upcoming, and an empty list when there are no sessions at all. */
export function summarizeMentorSessions(
  acceptedRequests: SelectSessionRequest[]
): { mode: "upcoming" | "past" | "none"; items: SessionOccurrence[] } {
  const now = moment()

  const upcoming = acceptedRequests
    .map((request) => {
      const occurrence = findNextOccurrence(request, now)
      return occurrence ? { request, occurrence } : null
    })
    .filter((v): v is SessionOccurrence => v !== null)
    .sort((a, b) => a.occurrence.valueOf() - b.occurrence.valueOf())
    .slice(0, 3)

  if (upcoming.length > 0) return { mode: "upcoming", items: upcoming }

  const past = acceptedRequests
    .map((request) => {
      const occurrence = findLastPastOccurrence(request, now)
      return occurrence ? { request, occurrence } : null
    })
    .filter((v): v is SessionOccurrence => v !== null)
    .sort((a, b) => b.occurrence.valueOf() - a.occurrence.valueOf())
    .slice(0, 3)

  if (past.length > 0) return { mode: "past", items: past }

  return { mode: "none", items: [] }
}
