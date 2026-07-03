import { MultiSelectOption } from "@/src/components/ui/multi-select"

export type TierType = "Starter" | "Intermediate" | "Advanced" | "Elite"
export type AvailabilityType = "Available" | "Fully booked" | "On leave"
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

export const ENGAGEMENT_TYPE_OPTIONS: MultiSelectOption[] = [
  { label: "Skill Mentorship", value: "Skill Mentorship" },
  { label: "FYP Supervision", value: "FYP Supervision" },
  { label: "Both", value: "Both" }
]

export interface AvailabilityRange {
  from: string
  to: string
}

export interface MentorFiltersType {
  skills: string[]
  availability: AvailabilityRange | undefined
  minRating: number
  engagementTypes: EngagementType[]
}

export const DEFAULT_FILTERS: MentorFiltersType = {
  skills: [],
  availability: undefined,
  minRating: 0,
  engagementTypes: []
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
    rating: 3,
    reviewCount: 48,
    activeMentees: 12,
    rpRequired: 800,
    availability: "Available",
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
    engagementType: "FYP Supervision"
  }
]
