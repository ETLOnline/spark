"use server"

import {
  CreateContact,
  DeleteContact,
  UpdateContact,
  GetContact,
  GetConnectionRequests
} from "@/src/db/data-access/contact/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { ActivityType } from "@/src/components/Dashboard/Connections/types/connections.types"
import { SendConnectionPushNotification } from "@/src/services/notifications/Connections/utils"
import { createContactEmailNotification } from "@/src/services/notify/contact/contact"
import { NotificationEvent } from "@/src/services/notify/types/events"
import pusherServer from "@/src/services/realtime/pusherServer"

export const CreateContactAction = CreateServerAction(
  true,
  async (contact_id: string) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { error: "Unauthorized", cause: 401 }

      const newRequest = await CreateContact(user.unique_id, contact_id)
      if (!newRequest?.[0])
        return { error: "Failed to create contact", success: false }

      await pusherServer.trigger(contact_id, ActivityType.request, {
        ...newRequest[0],
        otherUser: user
      })

      try {
        await createContactEmailNotification(
          NotificationEvent.NEW_CONNECTION,
          user,
          contact_id
        )
      } catch (error) {
        console.error("Failed to add notification:", error)
      }

      await SendConnectionPushNotification(
        NotificationEvent.NEW_CONNECTION,
        newRequest[0]
      )

      return { success: true, data: newRequest[0] }
    } catch (error) {
      return { error, success: false }
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

      await pusherServer.trigger(user_id, ActivityType.acceptRequest, {
        ...res[0],
        otherUser: user
      })

      try {
        await createContactEmailNotification(
          NotificationEvent.CONNECTION_ACCEPTED,
          user,
          user_id
        )
      } catch (error) {
        console.error(error)
      }

      await SendConnectionPushNotification(
        NotificationEvent.CONNECTION_ACCEPTED,
        res[0]
      )

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
      const authUser = await AuthUserAction()
      const currentUserId = authUser?.unique_id

      const updatedConnection = await UpdateContact(user_id, contact_id, {
        is_requested: 0,
        is_accepted: 0
      })
      const targetChannel = currentUserId === user_id ? contact_id : user_id
      await pusherServer.trigger(
        targetChannel,
        ActivityType.delRequest,
        updatedConnection[0]
      )

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
      const authUser = await AuthUserAction()
      const currentUserId = authUser?.unique_id

      const deletedConnection = await DeleteContact(user_id, contact_id)

      const targetChannel = currentUserId === user_id ? contact_id : user_id
      await pusherServer.trigger(
        targetChannel,
        ActivityType.delRequest,
        deletedConnection[0]
      )
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
        const connectionRequests = await GetConnectionRequests(user_id)
        const IncomingConnectionReqs = connectionRequests?.contacts.map(
          (connectionReq) => ({
            ...connectionReq,
            // Normalize the direction - always return the other user
            otherUser: connectionReq.user
          })
        )
        const OutgoingConnectionReqs = connectionRequests?.users.map(
          (connectionReq) => ({
            ...connectionReq,
            // Normalize the direction - always return the other user
            otherUser: connectionReq.contact
          })
        )
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
