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
  bio: string
  newTags: InsertTag[]
  existingTags: InsertTag[]
  deletedTagsIds: number[]
}

export type Profile = {
  recommendations: ExtendedRecommendations[]
  rewards: Reward[]
  activities: Activity[]
  tags: InsertTag[]
}
