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
function recurrenceEndDate(p: RecurrencePattern) {
  if (p.repeat_type === "none") return p.date
  return p.repeat_end_date ?? "9999-12-31"
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
