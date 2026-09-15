export interface ActionItem {
  id: string
  text: string
  done: boolean
}

export interface MomFormState {
  meeting_date: string
  meeting_start_time: string
  meeting_end_time: string
  participants: string[] // space user_ids
  discussion_summary: string
  action_items: ActionItem[]
}

export const EMPTY_MOM_FORM: MomFormState = {
  meeting_date: "",
  meeting_start_time: "",
  meeting_end_time: "",
  participants: [],
  discussion_summary: "",
  action_items: []
}
