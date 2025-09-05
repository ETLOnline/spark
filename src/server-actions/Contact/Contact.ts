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
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { ActivityType } from "@/src/components/Dashboard/Connections/types/connections.types"
import { AddNotification } from "@/src/db/data-access/notification/query"
import {
  NotificationEntity,
  NotificationType
} from "@/src/components/Dashboard/Notifications/types/notifications.types"
import { beamsServerClient } from "@/src/services/notifications/BeamServer"
import { SelectUserByUniqueId } from "@/src/db/data-access/user/query"

export const CreateContactAction = CreateServerAction(
  true,
  async (contact_id: string) => {
    try {
      const user = await AuthUserAction()

      if (!user) {
        return { error: "Unauthorized", cause: 401 }
      }

      const newRequest = await CreateContact(user.unique_id, contact_id)

      if (!newRequest?.[0]) {
        return { error: "Failed to create contact", success: false }
      }

      const realTimeChannel = AblyClientRest.channels.get(contact_id)
      realTimeChannel.publish(ActivityType.request, {
        ...newRequest[0],
        otherUser: user
      })

      try {
        const data = await AddNotification({
          created_by: user.unique_id,
          received_by: contact_id,
          type: NotificationType.requestSent,
          entity_type: NotificationEntity.request,
          entity_id: `${newRequest[0].user_id}${newRequest[0].contact_id}`
        })

        await realTimeChannel.publish("notification", {
          ...data,
          creator: user
        })
      } catch (error) {
        console.error("Failed to add notification:", error)
      }

      const contactUser = await SelectUserByUniqueId(contact_id)

      if (newRequest[0].is_requested === 1) {
        console.log("Sending Beams Notification")
        await beamsServerClient.publishToInterests([`user-${contact_id}`], {
          web: {
            notification: {
              title: "New Connection Request",
              body: `${user.first_name} ${user.last_name} has sent you a connection request.`,
              deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/connections`,
              icon: user.profile_url ?? undefined
            }
          }
        })
      }

      return { success: true, data: newRequest[0] }
    } catch (error) {
      return {
        error,
        success: false
      }
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

      const realTimeChannel = AblyClientRest.channels.get(user_id)
      realTimeChannel.publish(ActivityType.acceptRequest, {
        ...res[0],
        otherUser: user
      })

      try {
        const data = await AddNotification({
          created_by: contact_id,
          received_by: user_id,
          type: NotificationType.outgoingRequestAcceptance,
          entity_type: NotificationEntity.request,
          entity_id: `${user_id}-${contact_id}`
        })

        await realTimeChannel.publish("notification", {
          ...data,
          creator: user
        })
      } catch (error) {
        console.error(error)
      }

      if (res[0].is_accepted === 1) {
        await beamsServerClient.publishToInterests([`user-${user_id}`], {
          web: {
            notification: {
              title: "Connection Accepted",
              body: `${user.first_name} ${user.last_name} has accepted your connection request. You’re now connected.`,
              deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/connections`,
              icon: user.profile_url ?? undefined
            }
          }
        })
      }

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
      const curreUserId = (await AuthUserAction())?.unique_id
      const deletedConnection = await DeleteContact(user_id, contact_id)
      const realtimeChannel = AblyClientRest.channels.get(
        curreUserId === user_id ? contact_id : user_id
      )
      realtimeChannel.publish(ActivityType.delRequest, deletedConnection[0])
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
