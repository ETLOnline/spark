"use server"

import {
  AddShortcut,
  DeleteShortcut,
  GetUserShortcuts,
  DeleteShortcutsByUrl,
  UpdateShortcutTitle
} from "@/src/db/data-access/shortcuts/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { InsertShortcut } from "@/src/db/schema"
import pusherServer from "@/src/services/realtime/pusherServer"

export const getUserShortcutsAction = CreateServerAction(true, async () => {
  try {
    const user = await AuthUserAction()
    const shortcuts = await GetUserShortcuts(user.unique_id)
    return { success: true, data: shortcuts }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch user shortcuts"
    }
  }
})

export const createShortcutAction = CreateServerAction(
  true,
  async (shortcutData: Partial<InsertShortcut>) => {
    try {
      const user = await AuthUserAction()
      shortcutData.user_id = user.unique_id
      const shortcut = await AddShortcut(shortcutData as InsertShortcut)
      return { success: true, data: shortcut }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to add shortcut"
      }
    }
  }
)

export const deleteShortcutAction = CreateServerAction(
  true,
  async (shortcutId: string) => {
    try {
      await DeleteShortcut(shortcutId)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to delete shortcut"
      }
    }
  }
)

export const deleteShortcutsByUrlAction = CreateServerAction(
  true,
  async (
    userId: string,
    type: "community" | "channel" | "space" | "project",
    urlPattern: string
  ) => {
    try {
      await DeleteShortcutsByUrl(userId, type, urlPattern)

      await pusherServer.trigger(`user-${userId}`, "shortcut-deleted", {
        type,
        urlPattern,
        timestamp: Date.now()
      })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to delete shortcuts"
      }
    }
  }
)

export const UpdateShortcutTitleAction = CreateServerAction(
  true,
  async (shortcutEntityId: string, type: "community" | "channel" | "space" | "project",newTitle: string) => {
    try {
      await UpdateShortcutTitle(shortcutEntityId, type, newTitle)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to delete shortcuts"
      }
    }
  }
)
