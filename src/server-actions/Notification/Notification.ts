"use server"

import { InsertNotification } from "@/src/db/schema"
import {
  AddNotification,
  GetNotifications,
  MarkNotificationAsRead
} from "../../db/data-access/notification/query"
import { CreateServerAction } from ".."
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { AuthUserAction } from "../User/AuthUserAction"

export const AddNotificationAction = CreateServerAction(
  true,
  async (payload: InsertNotification) => {
    try {
      const data = await AddNotification(payload)
      const user = await AuthUserAction()
      const realTimeChannel = AblyClientRest.channels.get(payload.received_by)
      await realTimeChannel.publish("notification", { ...data, creator: user })
      return { success: true, data }
    } catch (error: any) {
      return { error: error, success: false }
    }
  }
)

export const GetNotificationsAction = CreateServerAction(true, async () => {
  try {
    const notifications = await GetNotifications()
    return { success: true, data: notifications }
  } catch (error: any) {
    return { error: error, success: false }
  }
})

export const MarkNotificationAsReadAction = CreateServerAction(
  true,
  async (id: number) => {
    try {
      const data = await MarkNotificationAsRead(id)
      return { success: true, data }
    } catch (error: any) {
      return { error: error, success: false }
    }
  }
)

export const DeleteNotificationAction = CreateServerAction(
  true,
  async (id: number) => {
    try {
      const data = await MarkNotificationAsRead(id)
      return { success: true, data }
    } catch (error: any) {
      return { error: error, success: false }
    }
  }
)
