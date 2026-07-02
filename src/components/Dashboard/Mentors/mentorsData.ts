import { MultiSelectOption } from "@/src/components/ui/multi-select"

export type TierType = "Starter" | "Intermediate" | "Advanced" | "Elite"
export type AvailabilityType = "Available" | "Fully booked" | "On leave"
export type SessionFormat = "One-on-One" | "Group" | "Both"
export type EngagementType = "Skill Mentorship" | "FYP Supervision" | "Both"

export const SKILL_OPTIONS: MultiSelectOption[] = [
  { label: "React", value: "React" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "System Design", value: "System Design" },
  { label: "Product Strategy", value: "Product Strategy" },
  { label: "Agile", value: "Agile" },
  { label: "UX Research", value: "UX Research" },
  { label: "Machine Learning", value: "Machine Learning" },
  { label: "Python", value: "Python" },
  { label: "Data Analysis", value: "Data Analysis" }
]

export const TIER_OPTIONS: MultiSelectOption[] = [
  { label: "Starter", value: "Starter" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
  { label: "Elite", value: "Elite" }
]

export const SESSION_FORMAT_OPTIONS: MultiSelectOption[] = [
  { label: "One-on-One", value: "One-on-One" },
  { label: "Group", value: "Group" },
  { label: "Both", value: "Both" }
]

export const ENGAGEMENT_TYPE_OPTIONS: MultiSelectOption[] = [
  { label: "Skill Mentorship", value: "Skill Mentorship" },
  { label: "FYP Supervision", value: "FYP Supervision" },
  { label: "Both", value: "Both" }
]

export interface MentorFiltersType {
  skills: string[]
  availability: string // "all" | "available-now" | "available-this-week"
  tiers: TierType[]
  minRating: number
  sessionFormats: SessionFormat[]
  engagementTypes: EngagementType[]
  rpEligibleOnly: boolean
}

export const DEFAULT_FILTERS: MentorFiltersType = {
  skills: [],
  availability: "all",
  tiers: [],
  minRating: 0,
  sessionFormats: [],
  engagementTypes: [],
  rpEligibleOnly: false
}

export interface MentorData {
  id: string
  name: string
  photo: string | null
  initials: string
  title: string
  company: string
  tags: string[]
  tier: TierType
  rating: number
  reviewCount: number
  activeMentees: number
  rpRequired: number
  availability: AvailabilityType
  sessionFormat: SessionFormat
  engagementType: EngagementType
}

export const MENTORS_DATA: MentorData[] = [
  {
    id: "1",
    name: "Sarah Chen",
    photo: null,
    initials: "SC",
    title: "Senior Software Engineer",
    company: "Google",
    tags: ["React", "TypeScript", "System Design"],
    tier: "Elite",
    rating: 4.9,
    reviewCount: 48,
    activeMentees: 12,
    rpRequired: 800,
    availability: "Available",
    sessionFormat: "One-on-One",
    engagementType: "Skill Mentorship"
  },
  {
    id: "2",
    name: "Alex Johnson",
    photo: null,
    initials: "AJ",
    title: "Product Manager",
    company: "Meta",
    tags: ["Product Strategy", "Agile", "UX Research"],
    tier: "Advanced",
    rating: 4.6,
    reviewCount: 31,
    activeMentees: 8,
    rpRequired: 600,
    availability: "Available",
    sessionFormat: "Both",
    engagementType: "Both"
  },
  {
    id: "3",
    name: "Emma Davis",
    photo: null,
    initials: "ED",
    title: "Data Scientist",
    company: "Amazon",
    tags: ["Machine Learning", "Python", "Data Analysis"],
    tier: "Intermediate",
    rating: 4.2,
    reviewCount: 19,
    activeMentees: 5,
    rpRequired: 400,
    availability: "Fully booked",
    sessionFormat: "Group",
    engagementType: "FYP Supervision"
  }
]

export const USER_RP_BALANCE = 500
