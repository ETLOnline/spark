import {
  AdvisorFilter,
  PaginatedResult
} from "@/src/types/Advisors/AdminAdvisors"

export const ADVISOR_PAGE_SIZE = 10

/** An empty page of results, shown while the first page loads or after an error. */
export const emptyPage = <T>(page: number): PaginatedResult<T> => ({
  rows: [],
  pagination: { total: 0, page, limit: ADVISOR_PAGE_SIZE, totalPages: 0 }
})

/** Makes a stored URL safe to use as an external href ("linkedin.com/in/x" → "https://linkedin.com/in/x"). */
export const toExternalUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`

/** URL without protocol/www, for display. */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/i, "")

const BASE = "/admin/analytics/advisors"

export const ADVISOR_ROUTES = {
  overview: BASE,
  /** The overview page with its advisors table filtered. */
  filtered: (filter: AdvisorFilter) => `${BASE}?filter=${filter}`,
  projects: `${BASE}/projects`,
  project: (spaceId: string) => `${BASE}/projects/${spaceId}`
}

/** Text link style for names/titles in the drill-down tables (readable on white). */
export const DRILLDOWN_LINK_CLASS =
  "font-medium text-teal-700 dark:text-teal-400 underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"

/** Same padding/rhythm as AnalyticsPage, for pages that render their own header. */
export const DRILLDOWN_PAGE_CLASS =
  "flex flex-col gap-4 sm:gap-6 p-1 py-4 sm:p-4 lg:p-6 w-full min-w-0"

export const ADVISOR_FILTER_DESCRIPTIONS: Record<AdvisorFilter, string> = {
  all: "Every registered FYP advisor",
  active: "Advisors on at least one ongoing project",
  verified: "Advisors with a verified profile"
}

export const ADVISOR_FILTER_TITLES: Record<AdvisorFilter, string> = {
  all: "All Advisors",
  active: "Active Advisors",
  verified: "Verified Advisors"
}
