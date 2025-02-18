export enum PostType {
  text = "text",
  image = "image",
  poll = "poll",
  file = "file"
}

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
  category?: string
}

export type PostFile = Omit<Post, "content"> & {
  content: File
  fileName: string
  fileSize: number
}

export type PostPoll = Post & { options: string[] }

export interface NewPost {
  content?: string
  type?: PostType
  category?: string
  hashtags: any[]
  fileName?: string
  fileSize?: string
  fileType?: string
  fileBase64?: string
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
