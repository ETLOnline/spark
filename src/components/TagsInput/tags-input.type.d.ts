export type Tag = {
  name: string
  id?: number
  status: TagStatus
  deleted?: boolean
  count?: number
}

export enum TagStatus {
  saved = "saved",
  selected = "selected",
  new = "new"
}
