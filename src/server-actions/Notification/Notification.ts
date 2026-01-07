"use server"

import { InsertNotification } from "@/src/db/schema"
import {
  AddNotification,
  GetNotifications,
  MarkNotificationAsRead
} from "../../db/data-access/notification/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import pusherServer from "@/src/services/realtime/pusherServer"

export const AddNotificationAction = CreateServerAction(
  true,
  async (payload: InsertNotification) => {
    try {
      const data = await AddNotification(payload)
      const user = await AuthUserAction()

      await pusherServer.trigger(
        payload.received_by, 
        "notification", 
        { 
          ...data, 
          creator: user 
        }
      );

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
  async (id: number | number[]) => {
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