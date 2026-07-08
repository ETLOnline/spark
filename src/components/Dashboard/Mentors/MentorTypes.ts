import { MultiSelectOption } from "@/src/components/ui/multi-select"

export type EngagementType = "Skill Mentorship" | "FYP Supervision" | "Both"

export const RATING_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "0" },
  { label: "4+ stars", value: "4" },
  { label: "3+ stars", value: "3" }
]

export const ENGAGEMENT_TYPE_OPTIONS: MultiSelectOption[] = [
  { label: "Skill Mentorship", value: "skill mentorship" },
  { label: "FYP Supervision", value: "fyp supervision" },
  { label: "Both", value: "both" }
]

export interface AvailabilityRange {
  from: string
  to: string
}

export interface MentorFiltersType {
  skills: string[]
  interests: string[]
  availability: AvailabilityRange | undefined
  minRating: number
  engagementTypes: EngagementType[]
}

export const DEFAULT_FILTERS: MentorFiltersType = {
  skills: [],
  interests: [],
  availability: undefined,
  minRating: 0,
  engagementTypes: []
}
