// Presentational constants only — every number shown on the analytics pages
// comes from the admin report snapshot (GetReportSnapshotAction).

/** Badge colours for the top three positions in analytics rankings (rank 4+ is a plain number). */
export const RANK_BADGE_CLASSES: Record<number, string> = {
  1: "bg-amber-100 text-amber-700 border-amber-300 font-bold",
  2: "bg-gray-100 text-gray-500 border-gray-300 font-semibold",
  3: "bg-orange-100 text-orange-600 border-orange-300 font-semibold"
}

/** Dot/bar colours for dynamic series (roles, action types), picked by index. */
export const SERIES_BG_CLASSES = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-slate-400"
]

/** Matching text colours for chart segments drawn with currentColor (same order as SERIES_BG_CLASSES). */
export const SERIES_STROKE_CLASSES = [
  "text-emerald-500",
  "text-blue-500",
  "text-amber-500",
  "text-violet-500",
  "text-pink-500",
  "text-cyan-500",
  "text-orange-500",
  "text-slate-400"
]

export const AVATAR_CLASSES = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700"
]
