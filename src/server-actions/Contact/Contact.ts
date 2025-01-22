"use server"

import {
  CreateContact,
  DeleteContact,
  GetOutgoingConnectionRequests,
  GetIncomingConnectionRequests,
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

export const DeleteConnectionAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      await UpdateContact(user_id, contact_id, {
        is_requested: 0,
        is_accepted: 0
      })
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteContactAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      await DeleteContact(user_id, contact_id)
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
      const IncomingConnectionReqs = (
        await GetIncomingConnectionRequests(user_id)
      ).map((connectionReq) => ({
        ...connectionReq,
        // Normalize the direction - always return the other user
        otherUser: connectionReq.user
      }))
      const OutgoingConnectionReqs = (
        await GetOutgoingConnectionRequests(user_id)
      ).map((connectionReq) => ({
        ...connectionReq,
        // Normalize the direction - always return the other user
        otherUser: connectionReq.contact
      }))
      const connectionReqs = [
        ...IncomingConnectionReqs,
        ...OutgoingConnectionReqs
      ]
      return { success: true, data: connectionReqs }
    } catch (error) {
      return { error: error, success: false }
    }
  }
)
