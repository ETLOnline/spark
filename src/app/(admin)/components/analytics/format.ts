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
