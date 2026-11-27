import moment from "moment-timezone"

export const MIN_DURATION_MINS = 30

/** Convert a "HH:mm" string to minutes since midnight. */
export function toMins(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export interface RecurrencePattern {
  date: string // YYYY-MM-DD anchor / first occurrence
  repeat_type: string // "none" | "daily" | "weekly"
  repeat_end_date?: string | null
}

/** Last date (inclusive) this pattern can occur on. */
export function recurrenceEndDate(p: RecurrencePattern) {
  if (p.repeat_type === "none") return p.date
  return p.repeat_end_date ?? "9999-12-31"
}

/**
 * Earliest date (YYYY-MM-DD) this pattern occurs on at or after
 * `fromDateStr`, or null if the pattern has no occurrence left on/after that
 * date (one-time slot already passed, or recurring series already ended).
 * Date-only — callers needing time-of-day precision (e.g. "has today's
 * occurrence already started") should combine the result with start_time
 * and re-call with the next day's date string to roll forward.
 */
export function nextOccurrenceDate(
  p: RecurrencePattern,
  fromDateStr: string
): string | null {
  if (p.repeat_type === "none") {
    return p.date >= fromDateStr ? p.date : null
  }

  const start = p.date > fromDateStr ? p.date : fromDateStr
  const end = recurrenceEndDate(p)
  if (start > end) return null
  if (p.repeat_type === "daily") return start

  // Weekly: first date >= start matching the anchor's day-of-week.
  const anchorDow = moment(p.date, "YYYY-MM-DD").day()
  const diff = (anchorDow - moment(start, "YYYY-MM-DD").day() + 7) % 7
  const next = moment(start, "YYYY-MM-DD")
    .add(diff, "days")
    .format("YYYY-MM-DD")
  return next <= end ? next : null
}

/**
 * True if two recurrence patterns (each one-time, daily, or weekly) share
 * at least one calendar date — used to detect scheduling conflicts between
 * two recurring/one-time bookings without expanding either into individual
 * occurrences. Mirrors the day-of-week + date-range overlap check already
 * used for availability-slot conflicts.
 */
export function recurrencesOverlap(a: RecurrencePattern, b: RecurrencePattern) {
  const aEnd = recurrenceEndDate(a)
  const bEnd = recurrenceEndDate(b)
  if (aEnd < b.date || bEnd < a.date) return false

  if (a.repeat_type === "daily" || b.repeat_type === "daily") return true
  if (a.repeat_type === "none" && b.repeat_type === "none") {
    return a.date === b.date
  }
  // At least one is weekly (neither is daily) — same day-of-week required
  return (
    moment(a.date, "YYYY-MM-DD").day() === moment(b.date, "YYYY-MM-DD").day()
  )
}

/** Total number of occurrences (inclusive of the anchor date) this pattern
 * covers — 1 for a one-time pattern, Infinity for an open-ended recurring
 * pattern with no repeat_end_date. */
export function countOccurrences(p: RecurrencePattern): number {
  if (p.repeat_type === "none") return 1
  if (!p.repeat_end_date) return Infinity
  const days = moment(p.repeat_end_date, "YYYY-MM-DD").diff(
    moment(p.date, "YYYY-MM-DD"),
    "days"
  )
  const step = p.repeat_type === "daily" ? 1 : 7
  return Math.max(1, Math.floor(days / step) + 1)
}

/**
 * Every occurrence date (YYYY-MM-DD, ascending) this pattern has on or after
 * `fromDateStr`, through its repeat_end_date — or a 1-year cap from
 * `fromDateStr` if open-ended (no repeat_end_date), matching the cap already
 * used for the "repeat until" picker (getRepeatUntilOptions in
 * mentorCalendarUtils.ts). Empty array if the pattern has no occurrence
 * left on/after `fromDateStr`.
 */
export function expandOccurrences(
  p: RecurrencePattern,
  fromDateStr: string
): string[] {
  const first = nextOccurrenceDate(p, fromDateStr)
  if (!first) return []
  if (p.repeat_type === "none") return [first]

  const step = p.repeat_type === "daily" ? 1 : 7
  const end =
    p.repeat_end_date ??
    moment(fromDateStr, "YYYY-MM-DD").add(1, "year").format("YYYY-MM-DD")
  const endMoment = moment(end, "YYYY-MM-DD")

  const dates: string[] = []
  let cursor = moment(first, "YYYY-MM-DD")
  while (!cursor.isAfter(endMoment)) {
    dates.push(cursor.format("YYYY-MM-DD"))
    cursor = cursor.clone().add(step, "days")
  }
  return dates
}
