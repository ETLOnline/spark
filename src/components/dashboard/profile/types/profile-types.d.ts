export type Recommendation = {
  name: string
  text: string
}

export type Reward = {
  title: string
  description: string
}

export type Activity = {
  date: string
  description: string
}

export type Tag = {
  name: string
  id?: number
  status: TagStatus
}

export enum TagStatus {
  1 = "saved",
  2 = "selected",
  3 = "new"
}

export enum TagType {
  interest = "interest",
  skill = "skill"
}
