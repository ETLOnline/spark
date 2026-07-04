import { SelectProfile, SelectUser } from "@/src/db/schema"

export type CompletionKey =
  | "bio"
  | "skills"
  | "interests"
  | "education"
  | "availability"

export type CompletionItem = {
  key: CompletionKey
  label: string
  completed: boolean
}

export type SimpleTag = {
  id: number
  name: string
  type?: string | null
}

export type CompletionInput = {
  profile?: Partial<SelectProfile> | null
  skills: SimpleTag[]
  interests: SimpleTag[]
  /** Only mentors have an availability requirement. */
  isMentor?: boolean
  hasAvailability?: boolean
}

const hasValue = (val?: string | null) => !!val && val.trim() !== ""

export const getCompletionItems = ({
  profile,
  skills,
  interests,
  isMentor,
  hasAvailability
}: CompletionInput): CompletionItem[] => {
  const educationComplete =
    hasValue(profile?.degree) &&
    hasValue(profile?.institute) &&
    hasValue(profile?.education_start_date) &&
    hasValue(profile?.education_end_date)

  const items: CompletionItem[] = [
    { key: "bio", label: "Bio", completed: hasValue(profile?.bio) },
    { key: "skills", label: "Skills", completed: skills.length > 0 },
    { key: "interests", label: "Interests", completed: interests.length > 0 },
    { key: "education", label: "Education", completed: educationComplete }
  ]

  if (isMentor) {
    items.push({
      key: "availability",
      label: "Availability",
      completed: !!hasAvailability
    })
  }

  return items
}

export const getCompletionPercentage = (items: CompletionItem[]): number => {
  if (items.length === 0) return 100
  const completed = items.filter((item) => item.completed).length
  return Math.round((completed / items.length) * 100)
}

export type { SelectProfile, SelectUser }
