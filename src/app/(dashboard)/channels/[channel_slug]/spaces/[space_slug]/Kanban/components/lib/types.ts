export type Task = {
  id: string
  title: string
  description: string
  status: string
}

export type Column = {
  id: string
  title: string
  tasks: Task[]
}

