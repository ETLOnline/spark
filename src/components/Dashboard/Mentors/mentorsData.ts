import { MultiSelectOption } from "@/src/components/ui/multi-select"

export type TierType = "Elite" | "Expert" | "Skilled" | "Rising" | "Starter"
export type AvailabilityType = "Available" | "Limited" | "Busy"
export type EngagementType = "One-on-One" | "Group" | "Both"
export type SessionFormat = "Video Call" | "Chat" | "Async"

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

export const ENGAGEMENT_OPTIONS: MultiSelectOption[] = [
  { label: "One-on-One", value: "One-on-One" },
  { label: "Group", value: "Group" },
  { label: "Both", value: "Both" }
]

export const FORMAT_OPTIONS: MultiSelectOption[] = [
  { label: "Video Call", value: "Video Call" },
  { label: "Chat", value: "Chat" },
  { label: "Async (own schedule)", value: "Async" }
]

export interface MentorFiltersType {
  skills: string[]
  availability: AvailabilityType[]
  tiers: TierType[]
  minRating: number
  engagementTypes: EngagementType[]
  sessionFormats: SessionFormat[]
  rpEligibleOnly: boolean
}

export const DEFAULT_FILTERS: MentorFiltersType = {
  skills: [],
  availability: [],
  tiers: [],
  minRating: 0,
  engagementTypes: [],
  sessionFormats: [],
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
  engagementType: EngagementType
  sessionFormats: SessionFormat[]
  rpEligible: boolean
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
    engagementType: "One-on-One",
    sessionFormats: ["Video Call", "Chat"],
    rpEligible: true
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
    engagementType: "Both",
    sessionFormats: ["Video Call", "Async"],
    rpEligible: true
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
    engagementType: "Group",
    sessionFormats: ["Chat", "Async"],
    rpEligible: false
  }
]
