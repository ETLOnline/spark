export type PostType = "text" | "image" | "poll" | "file"

export type Post = {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  type: PostType
  likes: number
  comments: Comment[]
  hashtags: string[]
  createdAt: string
  options?: string[]
}

export type NewPost = {
  content: string
  type: PostType
  hashtags: string[]
  options?: string[]
}

export type Comment = {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  createdAt: string
}
