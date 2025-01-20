export enum ActivityType {
  Connect_Received = "req received",
  Connect_Sent = "req sent",
  Connect_Accepted = "req accepted",
  Visited = "visit",
  Following = "following",
  Followed = "followed",
  Null = ""
}

export interface ProfileActivity {
  id: string
  user_id: string
  contact_id: string
  name: string
  avatar: string
  type: ActivityType
  timestamp: string
}
