import {
  ADVISOR_FILTERS,
  AdvisorFilter
} from "@/src/types/Advisors/AdminAdvisors"

/** Narrows an unknown value (e.g. a URL search param) to an AdvisorFilter. */
export const isAdvisorFilter = (value: unknown): value is AdvisorFilter =>
  typeof value === "string" &&
  (ADVISOR_FILTERS as readonly string[]).includes(value)
