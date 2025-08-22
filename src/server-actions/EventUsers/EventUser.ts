"use server"
import {
  InsertEventRegistration,
  SelectEventRegistration
} from "@/src/db/schema"
import { CreateServerAction } from ".."
import {
  CreateEventUser,
  GetEventAttendees,
  GetEventUserByIds
} from "@/src/db/data-access/eventUsers/query"

export const CreateEventUsersAction = CreateServerAction(
  true,
  async (eventData: InsertEventRegistration) => {
    try {
      const newEventUsers = await CreateEventUser(eventData)
      if ("error" in newEventUsers) {
        return { success: false, error: newEventUsers.error }
      }
      return { success: true, data: newEventUsers }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetEventUserByIdAction = CreateServerAction(
  true,
  async (params: Partial<SelectEventRegistration>) => {
    try {
      if (!params.event_id || !params.user_id) {
        throw new Error("event_id and user_id are required")
      }

      const res = await GetEventUserByIds(params.event_id, params.user_id)
      return { success: true, data: res }
    } catch (error) {
      return { error }
    }
  }
)

export const GetEventAttendeesAction = CreateServerAction(
  true,
  async (event_id: number) => {
    try {
      if (!event_id || typeof event_id !== "number" || event_id <= 0) {
        throw new Error("A valid event_id is required")
      }

      const userAttendees = await GetEventAttendees(event_id)

      if (!userAttendees) {
        return {
          success: true,
          message: "No attendees found for this event",
          data: []
        }
      }

      return {
        success: true,
        data: userAttendees
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to fetch event attendees"
      }
    }
  }
)
