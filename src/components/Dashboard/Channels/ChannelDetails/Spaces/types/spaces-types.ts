export type Event = {
  name: string
  date: string //repalce with Date
}

export type Topic = {
  name: string
  posts: number
}

export type Stat = {
  name: string
  amount: number
  icon: React.ReactNode
}

export type DirItem = {
  id: number
  name: string
  type: "file" | "folder"
  size?: string
  updatedAt: string
  path: string
  url?: string
  children?: DirItem[]
  created_by?: string
}
