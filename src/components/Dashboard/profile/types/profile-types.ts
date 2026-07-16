import { InsertTag, SelectRecommendation } from "@/src/db/schema"

export type Recommendation = {
  name: string
  text: string
}

export type ExtendedRecommendations = SelectRecommendation & {
  recommender_full_name: string
}

export type Reward = {
  title: string
  description: string
}

export type Activity = {
  date: string
  description: string
}

export type ProfileData = {
  userId: string
  first_name?: string
  last_name?: string
  bio: string
  skills: number[]
  interests: number[]
  professional_title?: string
  company?: string
}

export type Profile = {
  rewards: Reward[]
  activities: Activity[]
  tags: InsertTag[]
}

export enum FypStatus {
  NotStarted = "Not started",
  IdeaPhase = "Idea phase",
  Development = "Development",
  FinalStage = "Final stage"
}
