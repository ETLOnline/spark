"use server"

import {
  CreateContact,
  DeleteContact,
  GetOutgoingConnectionRequests,
  GetIncomingConnectionRequests,
  UpdateContact,
  GetContact
} from "@/src/db/data-access/contact/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { ActivityType } from "@/src/components/Dashboard/ProfileActivity/types/activity.types.d"

export const CreateContactAction = CreateServerAction(
  true,
  async (contact_id: string) => {
    try {
      const user = await AuthUserAction()
      if (user) {
        const newRequest = await CreateContact(user.unique_id, contact_id)
        const realtimeChannel = AblyClientRest.channels.get(contact_id)
        await realtimeChannel.publish(ActivityType.request, {
          ...newRequest[0],
          otherUser: user
        })
      } else {
        return { error: "Unauthorized", cause: 401 }
      }
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
      const user = await AuthUserAction()
      const res = await UpdateContact(user_id, contact_id, {
        is_accepted: 1,
        is_requested: 0
      })
      const realtimeChannel = AblyClientRest.channels.get(user_id)
      realtimeChannel.publish(ActivityType.acceptRequest, {
        ...res[0],
        otherUser: user
      })
      return { success: true, data: res[0] }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteConnectionAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      const curreUserId = (await AuthUserAction())?.unique_id
      const updatedConnection = await UpdateContact(user_id, contact_id, {
        is_requested: 0,
        is_accepted: 0
      })
      const realtimeChannel = AblyClientRest.channels.get(
        curreUserId === user_id ? contact_id : user_id
      )
      realtimeChannel.publish(ActivityType.delRequest, updatedConnection[0])
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
  async () => {
    try {
      const user_id = (await AuthUserAction())?.unique_id
      if (user_id) {
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
        return {
          success: true,
          data: {
            incoming: IncomingConnectionReqs,
            outgoing: OutgoingConnectionReqs
          }
        }
      } else {
        throw new Error("Unauthorized", { cause: 401 })
      }
    } catch (error) {
      return { error: error, success: false }
    }
  }
)

export const GetContactAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string) => {
    try {
      const contact = await GetContact(user_id, contact_id)
      return { success: true, data: contact }
    } catch (error) {
      return { error: error, data: null }
    }
  }
)
