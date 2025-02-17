export type Tag = {
  name: string
  id?: number
  status: TagStatus
  deleted?: boolean
}

export enum TagStatus {
  saved = "saved",
  selected = "selected",
  new = "new"
}
