"use server"

import {
  CreateContact,
  DeleteContact,
  GetConnectionRequests,
  UpdateContact
} from "@/src/db/data-access/contact/query"
import { CreateServerAction } from ".."

export const CreateContactAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      await CreateContact(user_id, contact_id)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AcceptConnectionAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      await UpdateContact(user_id, contact_id, {
        is_accepted: 1,
        is_requested: 0
      })
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const RejectConnectionAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      await UpdateContact(user_id, contact_id, {
        is_requested: 0
      })
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteContactAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string, contactType: string) => {
    try {
      await DeleteContact(user_id, contact_id, contactType)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetConnectionRequestsAction = CreateServerAction(
  true,
  async (user_id: string) => {
    try {
      const connectionReqs = await GetConnectionRequests(user_id)
      return { success: true, data: connectionReqs }
    } catch (error) {
      return { error: error, success: false }
    }
  }
)
