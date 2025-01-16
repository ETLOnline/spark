export enum ActivityType {
  Connect_Received = "req eceived",
  Connect_Sent = "req sent",
  Visited = "visit",
  Following = "following",
  Followed = "followed"
}

export interface ProfileActivity {
  user_id: string
  contact_id: string
  name: string
  avatar: string
  type: ActivityType
  timestamp: string
}
