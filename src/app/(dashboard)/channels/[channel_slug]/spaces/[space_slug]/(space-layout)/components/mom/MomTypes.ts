import { z } from "zod"

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

export const momFormSchema = z
  .object({
    meeting_date: z.string().min(1, "Meeting date is required"),
    meeting_start_time: z.string().min(1, "Start time is required"),
    meeting_end_time: z.string().min(1, "End time is required"),
    participants: z.array(z.string()),
    discussion_summary: z
      .string()
      .trim()
      .min(1, "Discussion summary is required"),
    action_items: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        done: z.boolean()
      })
    )
  })
  .refine(
    (data) =>
      !data.meeting_start_time ||
      !data.meeting_end_time ||
      data.meeting_end_time > data.meeting_start_time,
    {
      message: "End time must be after start time.",
      path: ["meeting_end_time"]
    }
  )
