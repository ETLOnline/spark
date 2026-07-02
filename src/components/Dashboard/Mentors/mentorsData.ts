import { MultiSelectOption } from "@/src/components/ui/multi-select"

export type TierType = "Elite" | "Expert" | "Skilled" | "Rising" | "Starter"
export type AvailabilityType = "Available" | "Limited" | "Busy"
export type SessionType = "One-on-One" | "Group" | "Both"
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

export const AVAILABILITY_OPTIONS: MultiSelectOption[] = [
  { label: "Available", value: "Available" },
  { label: "Limited", value: "Limited" },
  { label: "Busy", value: "Busy" }
]

export const TIER_OPTIONS: MultiSelectOption[] = [
  { label: "Elite", value: "Elite" },
  { label: "Expert", value: "Expert" },
  { label: "Skilled", value: "Skilled" },
  { label: "Rising", value: "Rising" },
  { label: "Starter", value: "Starter" }
]

export const SESSION_TYPE_OPTIONS: MultiSelectOption[] = [
  { label: "1:1 Only", value: "One-on-One" },
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
  availability: AvailabilityType[]
  tiers: TierType[]
  minRating: number
  sessionTypes: SessionType[]
  engagementTypes: EngagementType[]
}

export const DEFAULT_FILTERS: MentorFiltersType = {
  skills: [],
  availability: [],
  tiers: [],
  minRating: 0,
  sessionTypes: [],
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
  sessionType: SessionType
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
    sessionType: "One-on-One",
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
    tier: "Expert",
    rating: 4.6,
    reviewCount: 31,
    activeMentees: 8,
    rpRequired: 600,
    availability: "Limited",
    sessionType: "Both",
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
    tier: "Skilled",
    rating: 4.2,
    reviewCount: 19,
    activeMentees: 5,
    rpRequired: 400,
    availability: "Busy",
    sessionType: "Group",
    engagementType: "FYP Supervision"
  }
]
