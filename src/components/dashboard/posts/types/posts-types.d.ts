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
}

export type PostFile = Post & {
  content: File
  fileName: string
  fileSize: number
}

export type PostPoll = Post & { options: string[] }

export type NewPost = {
  content: string | File
  type: PostType
  hashtags: string[]
  options?: string[]
  fileName?: string
  fileSize?: number
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
