/**
 * Display-only helpers for the analytics views. The snapshot already holds
 * every number — these only format what's there (nullable fields render as
 * "—" rather than a misleading 0).
 */

export const EMPTY_VALUE = "—"

export function formatCount(value: number | null | undefined) {
  return value === null || value === undefined
    ? EMPTY_VALUE
    : value.toLocaleString()
}

/**
 * Compact display for large KPI values (e.g. 12.4K) plus the full
 * locale-formatted number for a hover tooltip. Returns null when there's
 * nothing to show, so callers can fall back to an explicit "0" or error state.
 */
export function formatCompactCount(value: number | null | undefined) {
  if (value === null || value === undefined) return null
  return {
    compact: new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value),
    full: value.toLocaleString()
  }
}

/** Share of `total` as a 0–100 number, or null when either side is missing. */
export function toPercent(
  value: number | null | undefined,
  total: number | null | undefined
) {
  if (value === null || value === undefined || !total) return null
  return (value / total) * 100
}

export function formatPercent(
  value: number | null | undefined,
  total: number | null | undefined
) {
  const pct = toPercent(value, total)
  return pct === null ? EMPTY_VALUE : `${pct.toFixed(1)}%`
}

/**
 * Rounds each value's share of the total to `decimals` places so the
 * results always sum to exactly 100 — rounding each slice independently can
 * drift a few tenths off 100% when shares are close. Uses the largest
 * remainder method: floor every share, then hand the leftover points to
 * whichever values were closest to rounding up.
 */
export function toExactPercentages(values: number[], decimals = 1): number[] {
  const total = values.reduce((sum, v) => sum + v, 0)
  if (total <= 0) return values.map(() => 0)

  const scale = 10 ** decimals
  const target = 100 * scale
  const raw = values.map((v) => (v / total) * target)
  const floors = raw.map(Math.floor)
  const remainder = target - floors.reduce((sum, f) => sum + f, 0)

  const byRemainingFraction = raw
    .map((r, i) => ({ i, frac: r - floors[i] }))
    .sort((a, b) => b.frac - a.frac)

  const scaled = [...floors]
  for (let k = 0; k < remainder; k++) {
    scaled[byRemainingFraction[k].i] += 1
  }
  return scaled.map((v) => v / scale)
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

/** "comment_added" / "Super_Admin" → "Comment added" / "Super Admin" */
export function humanizeKey(key: string) {
  const spaced = key.replace(/_/g, " ")
  return spaced === spaced.toLowerCase()
    ? spaced.charAt(0).toUpperCase() + spaced.slice(1)
    : spaced
}
